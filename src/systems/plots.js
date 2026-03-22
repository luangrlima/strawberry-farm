(function (SF) {
  function getVisiblePlots(game) {
    return game.state.plots.slice(0, game.state.unlockedPlotCount);
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
    if (game.state.upgrades.helperGloves) {
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
    if (progress < 34) {
      return "Brotando";
    }
    if (progress < 67) {
      return "Crescendo";
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
    getPlotEmoji,
    getPlotName,
    getPlotBadge,
    getPlotStageText,
    getPlotTimerText,
    getPlotHint,
    getPlotLabel,
  };
})(window.StrawberryFarm = window.StrawberryFarm || {});
