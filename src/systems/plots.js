(function (SF) {
  function getFarmLevelConfigByLevel(level = 0) {
    const farmLevels = SF.config.farmLevels || [];
    return farmLevels[Math.max(0, Math.min(farmLevels.length - 1, level))] || {
      level: 0,
      label: "4x4",
      cols: 4,
      rows: 4,
      unlockedPlotCount: SF.config.maxPlotCount,
      expansionCost: 0,
    };
  }

  function getFarmLevelIndexByUnlockedPlotCount(unlockedPlotCount = SF.config.initialPlotCount) {
    const farmLevels = SF.config.farmLevels || [];
    let levelIndex = 0;

    farmLevels.forEach((farmLevel, index) => {
      if (unlockedPlotCount >= farmLevel.unlockedPlotCount) {
        levelIndex = index;
      }
    });

    return levelIndex;
  }

  function getFarmLevelConfig(game) {
    const level = Number.isFinite(game?.state?.farmLevel)
      ? game.state.farmLevel
      : getFarmLevelIndexByUnlockedPlotCount(game?.state?.unlockedPlotCount);
    return getFarmLevelConfigByLevel(level);
  }

  function isPlotUnlocked(game, plotIndex) {
    const farmLevel = getFarmLevelConfig(game);
    const row = Math.floor(plotIndex / 4);
    const col = plotIndex % 4;
    return row < farmLevel.rows && col < farmLevel.cols;
  }

  function getUnlockedPlotIndexes(game) {
    return game.state.plots
      .map((_, index) => index)
      .filter((index) => isPlotUnlocked(game, index));
  }

  function getVisiblePlots(game) {
    return getUnlockedPlotIndexes(game).map((index) => game.state.plots[index]);
  }

  function getSeedPrice(game) {
    const activeEvent = SF.events.getActiveEventDefinition(game);
    const discount = activeEvent?.seedPriceDiscount || 0;
    return Math.max(1, SF.config.crop.seedPrice - discount);
  }

  function getGrowthTimeMs(game) {
    let growthTime = SF.config.crop.growthTimeMs;
    const fertilizerLevel = SF.upgrades.getUpgradeLevel(game, "fertilizer");

    if (fertilizerLevel > 0) {
      growthTime *= SF.upgrades.getFertilizerGrowthMultiplier(fertilizerLevel);
    }

    const activeEvent = SF.events.getActiveEventDefinition(game);
    if (activeEvent?.growthMultiplier) {
      growthTime *= activeEvent.growthMultiplier;
    }

    return Math.max(3000, Math.floor(growthTime));
  }

  function getSpoilTimeMs(game) {
    if (SF.upgrades.hasHelperGloves(game)) {
      return 10000;
    }
    return SF.config.crop.spoilTimeMs;
  }

  function updatePlotsByTime(game, now = Date.now()) {
    let becameReady = false;
    let becameRotten = false;

    getVisiblePlots(game).forEach((plot) => {
      if (plot.state === SF.config.plotStates.ready && !Number.isFinite(plot.rottenAt)) {
        const spoilTime = getSpoilTimeMs(game);
        plot.rottenAt = now + spoilTime;
        plot.spoilDurationMs = spoilTime;
        becameReady = true;
        return;
      }

      if (plot.state === SF.config.plotStates.growing && Number.isFinite(plot.readyAt) && now >= plot.readyAt) {
        const spoilTime = getSpoilTimeMs(game);
        plot.state = SF.config.plotStates.ready;
        plot.plantedAt = null;
        plot.readyAt = null;
        plot.rottenAt = now + spoilTime;
        plot.spoilDurationMs = spoilTime;
        plot.growthDurationMs = null;
        becameReady = true;
        return;
      }

      if (plot.state === SF.config.plotStates.ready && Number.isFinite(plot.rottenAt) && now >= plot.rottenAt) {
        plot.state = SF.config.plotStates.rotten;
        plot.rottenAt = null;
        becameRotten = true;
      }
    });

    return {
      changed: becameReady || becameRotten,
      becameReady,
      becameRotten,
    };
  }

  function markPlotHarvested(game, plotId, source = "manual", now = Date.now()) {
    game.uiState.harvestedPlots[plotId] = {
      until: now + 450,
      source,
    };
  }

  function syncHarvestEffects(game, now = Date.now()) {
    Object.keys(game.uiState.harvestedPlots).forEach((plotId) => {
      if (game.uiState.harvestedPlots[plotId].until <= now) {
        delete game.uiState.harvestedPlots[plotId];
      }
    });
  }

  function plantPlot(game, plot, now = Date.now()) {
    plantPlotWithSource(game, plot, "manual", now);
  }

  function plantPlotWithSource(game, plot, source, now = Date.now()) {
    const isHelperPlant = source === "helper";

    if (game.state.seeds <= 0) {
      if (!isHelperPlant) {
        SF.runtime.showMessage(game, "Sem sementes.", { now });
      }
      return;
    }

    const growthDurationMs = getGrowthTimeMs(game);
    plot.state = SF.config.plotStates.growing;
    plot.plantedAt = now;
    plot.readyAt = now + growthDurationMs;
    plot.rottenAt = null;
    plot.growthDurationMs = growthDurationMs;
    game.state.seeds -= 1;

    if (isHelperPlant) {
      SF.helper.noteHelperPlant(game, plot.id, now);
    } else {
      game.setMessage("Plantado.");
    }

    game.commit({ now });
  }

  function harvestPlot(game, plot, now = Date.now()) {
    harvestPlotWithSource(game, plot, "manual", now);
  }

  function harvestPlotWithSource(game, plot, source, now = Date.now()) {
    const isHelperHarvest = source === "helper";
    const comboSummary = isHelperHarvest ? { count: 0, bonusMoney: 0 } : SF.combo.applyHarvestCombo(game, now);
    plot.state = SF.config.plotStates.empty;
    plot.plantedAt = null;
    plot.readyAt = null;
    plot.rottenAt = null;
    plot.growthDurationMs = null;
    plot.spoilDurationMs = null;
    game.state.strawberries += SF.config.crop.harvestYield;
    game.state.stats.harvestedTotal += SF.config.crop.harvestYield;
    markPlotHarvested(game, plot.id, source, now);

    if (isHelperHarvest) {
      SF.helper.noteHelperHarvest(game, plot.id, now);
    } else if (comboSummary.bonusMoney > 0) {
      game.state.money += comboSummary.bonusMoney;
      game.setMessage(`Colheita. Combo x${comboSummary.count}: +${comboSummary.bonusMoney}.`);
    } else if (comboSummary.count >= 2) {
      game.setMessage(`Colheita. Combo x${comboSummary.count}.`);
    } else {
      game.setMessage("Colheita.");
    }

    game.commit({ now });
  }

  function clearRottenPlot(game, plot, now = Date.now()) {
    clearRottenPlotWithSource(game, plot, "manual", now);
  }

  function clearRottenPlotWithSource(game, plot, source, now = Date.now()) {
    plot.state = SF.config.plotStates.empty;
    plot.plantedAt = null;
    plot.readyAt = null;
    plot.rottenAt = null;
    plot.growthDurationMs = null;
    plot.spoilDurationMs = null;

    if (source === "helper") {
      SF.helper.noteHelperClean(game, plot.id, now);
    } else {
      game.setMessage("Morangos estragados removidos.");
    }

    game.commit({ now });
  }

  function getFarmMetrics(game) {
    const visiblePlots = getVisiblePlots(game);
    const readyPlots = visiblePlots.filter((plot) => plot.state === SF.config.plotStates.ready).length;
    const growingPlots = visiblePlots.filter((plot) => plot.state === SF.config.plotStates.growing).length;
    const rottenPlots = visiblePlots.filter((plot) => plot.state === SF.config.plotStates.rotten).length;

    return {
      unlockedPlots: game.state.unlockedPlotCount,
      readyPlots,
      growingPlots,
      rottenPlots,
    };
  }

  function getPlotProgress(plot, now = Date.now()) {
    if (
      plot.state !== SF.config.plotStates.growing ||
      !Number.isFinite(plot.readyAt) ||
      !Number.isFinite(plot.plantedAt)
    ) {
      return plot.state === SF.config.plotStates.ready ? 100 : 0;
    }

    const duration = plot.growthDurationMs || SF.config.crop.growthTimeMs;
    const elapsed = now - plot.plantedAt;
    return Math.max(0, Math.min(100, (elapsed / duration) * 100));
  }

  function getSpoilProgress(plot, now = Date.now()) {
    if (plot.state !== SF.config.plotStates.ready || !Number.isFinite(plot.rottenAt)) {
      return 0;
    }
    const duration = plot.spoilDurationMs || SF.config.crop.spoilTimeMs;
    const remaining = Math.max(0, plot.rottenAt - now);
    return Math.max(0, Math.min(100, (remaining / duration) * 100));
  }

  function getPlotVisualModel(plot, now = Date.now()) {
    const strawberryRowY = 96;
    const visualModel = {
      groundVariant: "field",
      tilledVariant: "idle-soil",
      cropVariant: "none",
      overlayVariant: "none",
      progressVariant: "none",
      accentVariant: "none",
      moisture: "dry",
      soilBoost: "none",
      quality: "none",
      hazard: "none",
      cropFrameX: null,
      cropFrameY: null,
    };

    if (plot.state === SF.config.plotStates.empty) {
      return visualModel;
    }

    if (plot.state === SF.config.plotStates.ready) {
      return {
        ...visualModel,
        tilledVariant: "tilled-active",
        cropVariant: "strawberry-ready",
        overlayVariant: "ready-glint",
        progressVariant: "spoil-ring",
        cropFrameX: 0,
        cropFrameY: strawberryRowY,
      };
    }

    if (plot.state === SF.config.plotStates.rotten) {
      return {
        ...visualModel,
        groundVariant: "field-dim",
        tilledVariant: "tilled-weary",
        cropVariant: "strawberry-rotten",
        overlayVariant: "rotten-flies",
        cropFrameX: 0,
        cropFrameY: strawberryRowY,
      };
    }

    const progress = getPlotProgress(plot, now);

    if (progress < 20) {
      return {
        ...visualModel,
        tilledVariant: "tilled-active",
        cropVariant: "strawberry-growing-1",
        progressVariant: "grow-ring",
        cropFrameX: 80,
        cropFrameY: strawberryRowY,
      };
    }

    if (progress < 40) {
      return {
        ...visualModel,
        tilledVariant: "tilled-active",
        cropVariant: "strawberry-growing-2",
        progressVariant: "grow-ring",
        cropFrameX: 64,
        cropFrameY: strawberryRowY,
      };
    }

    if (progress < 60) {
      return {
        ...visualModel,
        tilledVariant: "tilled-active",
        cropVariant: "strawberry-growing-3",
        progressVariant: "grow-ring",
        cropFrameX: 48,
        cropFrameY: strawberryRowY,
      };
    }

    if (progress < 80) {
      return {
        ...visualModel,
        tilledVariant: "tilled-active",
        cropVariant: "strawberry-growing-4",
        progressVariant: "grow-ring",
        cropFrameX: 32,
        cropFrameY: strawberryRowY,
      };
    }

    return {
      ...visualModel,
      tilledVariant: "tilled-active",
      cropVariant: "strawberry-growing-5",
      progressVariant: "grow-ring",
      cropFrameX: 16,
      cropFrameY: strawberryRowY,
    };
  }

  function getPlotSprite(plot, now = Date.now()) {
    const visualModel = getPlotVisualModel(plot, now);

    if (visualModel.cropVariant === "none") {
      return {
        id: "soil",
        frameX: null,
        frameY: null,
      };
    }

    return {
      id: visualModel.cropVariant,
      frameX: visualModel.cropFrameX,
      frameY: visualModel.cropFrameY,
    };
  }

  function getPlotEmoji(plot) {
    if (plot.state === SF.config.plotStates.growing) {
      return "🌱";
    }
    if (plot.state === SF.config.plotStates.ready) {
      return "🍓";
    }
    if (plot.state === SF.config.plotStates.rotten) {
      return "💀";
    }
    return "⬜";
  }

  function getPlotName(plot) {
    if (plot.state === SF.config.plotStates.growing) {
      return "Crescendo";
    }
    if (plot.state === SF.config.plotStates.ready) {
      return "Pronto para colher";
    }
    if (plot.state === SF.config.plotStates.rotten) {
      return "Morangos estragados";
    }
    return "Terreno vazio";
  }

  function getPlotBadge(plot) {
    if (plot.state === SF.config.plotStates.growing) {
      return "Aguarde";
    }
    if (plot.state === SF.config.plotStates.ready) {
      return "Colher";
    }
    if (plot.state === SF.config.plotStates.rotten) {
      return "Limpar";
    }
    return "Plantar";
  }

  function getPlotStageText(plot, now = Date.now()) {
    if (plot.state === SF.config.plotStates.empty) {
      return "Pronto para plantar";
    }
    if (plot.state === SF.config.plotStates.ready) {
      return "Madura";
    }
    if (plot.state === SF.config.plotStates.rotten) {
      return "Estragado";
    }

    const progress = getPlotProgress(plot, now);
    if (progress < 20) {
      return "Semente";
    }
    if (progress < 40) {
      return "Broto";
    }
    if (progress < 60) {
      return "Folhas";
    }
    if (progress < 80) {
      return "Florindo";
    }
    return "Quase pronto";
  }

  function getPlotTimerText(plot, now = Date.now()) {
    if (plot.state === SF.config.plotStates.growing && Number.isFinite(plot.readyAt)) {
      const remainingMs = Math.max(0, plot.readyAt - now);
      return `Faltam ${SF.utils.formatSeconds(remainingMs)}`;
    }
    if (plot.state === SF.config.plotStates.ready && Number.isFinite(plot.rottenAt)) {
      const remainingMs = Math.max(0, plot.rottenAt - now);
      return `Estraga em ${SF.utils.formatSeconds(remainingMs)}`;
    }
    if (plot.state === SF.config.plotStates.ready) {
      return "Clique para colher";
    }
    if (plot.state === SF.config.plotStates.rotten) {
      return "Clique para limpar";
    }
    return "Clique para plantar";
  }

  function getPlotHint(plot, now = Date.now()) {
    if (plot.state === SF.config.plotStates.growing) {
      return `${Math.round(getPlotProgress(plot, now))}% concluído`;
    }
    if (plot.state === SF.config.plotStates.ready) {
      return "Colha antes de estragar";
    }
    if (plot.state === SF.config.plotStates.rotten) {
      return "Remova para plantar de novo";
    }
    return "Clique para plantar";
  }

  function getPlotLabel(plot, index, now = Date.now()) {
    return `Canteiro ${index + 1}: ${getPlotName(plot)}. Etapa: ${getPlotStageText(plot, now)}. ${getPlotTimerText(plot, now)}. ${getPlotHint(plot, now)}`;
  }

  SF.plots = {
    getVisiblePlots,
    getFarmLevelConfigByLevel,
    getFarmLevelIndexByUnlockedPlotCount,
    getFarmLevelConfig,
    getUnlockedPlotIndexes,
    isPlotUnlocked,
    getSeedPrice,
    getGrowthTimeMs,
    getSpoilTimeMs,
    updatePlotsByTime,
    markPlotHarvested,
    syncHarvestEffects,
    plantPlot,
    plantPlotWithSource,
    harvestPlot,
    harvestPlotWithSource,
    clearRottenPlot,
    clearRottenPlotWithSource,
    getFarmMetrics,
    getPlotProgress,
    getSpoilProgress,
    getPlotVisualModel,
    getPlotSprite,
    getPlotEmoji,
    getPlotName,
    getPlotBadge,
    getPlotStageText,
    getPlotTimerText,
    getPlotHint,
    getPlotLabel,
  };
})(window.StrawberryFarm = window.StrawberryFarm || {});
