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

  function updatePlotsByTime(game) {
    const now = Date.now();
    let changed = false;

    getVisiblePlots(game).forEach((plot) => {
      if (plot.state === SF.config.plotStates.growing && Number.isFinite(plot.readyAt) && now >= plot.readyAt) {
        plot.state = SF.config.plotStates.ready;
        plot.plantedAt = null;
        plot.readyAt = null;
        plot.growthDurationMs = null;
        changed = true;
      }
    });

    return changed;
  }

  function markPlotHarvested(game, plotId, source = "manual") {
    game.uiState.harvestedPlots[plotId] = {
      until: Date.now() + 450,
      source,
    };
  }

  function syncHarvestEffects(game) {
    const now = Date.now();

    Object.keys(game.uiState.harvestedPlots).forEach((plotId) => {
      if (game.uiState.harvestedPlots[plotId].until <= now) {
        delete game.uiState.harvestedPlots[plotId];
      }
    });
  }

  function plantPlot(game, plot) {
    plantPlotWithSource(game, plot, "manual");
  }

  function plantPlotWithSource(game, plot, source) {
    const isHelperPlant = source === "helper";

    if (game.state.seeds <= 0) {
      if (!isHelperPlant) {
        game.setMessage("Sem sementes.");
        SF.render.render(game);
      }
      return;
    }

    const now = Date.now();
    const growthDurationMs = getGrowthTimeMs(game);
    plot.state = SF.config.plotStates.growing;
    plot.plantedAt = now;
    plot.readyAt = now + growthDurationMs;
    plot.growthDurationMs = growthDurationMs;
    game.state.seeds -= 1;

    if (isHelperPlant) {
      SF.helper.noteHelperPlant(game, plot.id);
    } else {
      game.setMessage("Plantado.");
    }

    game.commit();
  }

  function harvestPlot(game, plot) {
    harvestPlotWithSource(game, plot, "manual");
  }

  function harvestPlotWithSource(game, plot, source) {
    const isHelperHarvest = source === "helper";
    const comboSummary = isHelperHarvest ? { count: 0, bonusMoney: 0 } : SF.combo.applyHarvestCombo(game);
    plot.state = SF.config.plotStates.empty;
    plot.plantedAt = null;
    plot.readyAt = null;
    plot.growthDurationMs = null;
    game.state.strawberries += SF.config.crop.harvestYield;
    game.state.stats.harvestedTotal += SF.config.crop.harvestYield;
    markPlotHarvested(game, plot.id, source);

    if (isHelperHarvest) {
      SF.helper.noteHelperHarvest(game, plot.id);
    } else if (comboSummary.bonusMoney > 0) {
      game.state.money += comboSummary.bonusMoney;
      game.setMessage(`Colheita. Combo x${comboSummary.count}: +${comboSummary.bonusMoney}.`);
    } else if (comboSummary.count >= 2) {
      game.setMessage(`Colheita. Combo x${comboSummary.count}.`);
    } else {
      game.setMessage("Colheita.");
    }

    game.commit();
  }

  function getFarmMetrics(game) {
    const visiblePlots = getVisiblePlots(game);
    const readyPlots = visiblePlots.filter((plot) => plot.state === SF.config.plotStates.ready).length;
    const growingPlots = visiblePlots.filter((plot) => plot.state === SF.config.plotStates.growing).length;

    return {
      unlockedPlots: game.state.unlockedPlotCount,
      readyPlots,
      growingPlots,
    };
  }

  function getPlotProgress(plot) {
    if (
      plot.state !== SF.config.plotStates.growing ||
      !Number.isFinite(plot.readyAt) ||
      !Number.isFinite(plot.plantedAt)
    ) {
      return plot.state === SF.config.plotStates.ready ? 100 : 0;
    }

    const duration = plot.growthDurationMs || SF.config.crop.growthTimeMs;
    const elapsed = Date.now() - plot.plantedAt;
    return Math.max(0, Math.min(100, (elapsed / duration) * 100));
  }

  function getPlotEmoji(plot) {
    if (plot.state === SF.config.plotStates.growing) {
      return "🌱";
    }
    if (plot.state === SF.config.plotStates.ready) {
      return "🍓";
    }
    return "🟫";
  }

  function getPlotName(plot) {
    if (plot.state === SF.config.plotStates.growing) {
      return "Crescendo";
    }
    if (plot.state === SF.config.plotStates.ready) {
      return "Pronto para colher";
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
    return "Plantar";
  }

  function getPlotStageText(plot) {
    if (plot.state === SF.config.plotStates.empty) {
      return "Pronto para plantar";
    }
    if (plot.state === SF.config.plotStates.ready) {
      return "Madura";
    }

    const progress = getPlotProgress(plot);
    if (progress < 34) {
      return "Brotando";
    }
    if (progress < 67) {
      return "Crescendo";
    }
    return "Quase pronto";
  }

  function getPlotTimerText(plot) {
    if (plot.state === SF.config.plotStates.growing && Number.isFinite(plot.readyAt)) {
      const remainingMs = Math.max(0, plot.readyAt - Date.now());
      return `Faltam ${SF.utils.formatSeconds(remainingMs)}`;
    }
    if (plot.state === SF.config.plotStates.ready) {
      return "Clique para colher";
    }
    return "Clique para plantar";
  }

  function getPlotHint(plot) {
    if (plot.state === SF.config.plotStates.growing) {
      return `${Math.round(getPlotProgress(plot))}% concluído`;
    }
    if (plot.state === SF.config.plotStates.ready) {
      return "Clique agora para colher";
    }
    return "Clique para plantar";
  }

  function getPlotLabel(plot, index) {
    return `Canteiro ${index + 1}: ${getPlotName(plot)}. Etapa: ${getPlotStageText(plot)}. ${getPlotTimerText(plot)}. ${getPlotHint(plot)}`;
  }

  SF.plots = {
    getVisiblePlots,
    getSeedPrice,
    getGrowthTimeMs,
    updatePlotsByTime,
    markPlotHarvested,
    syncHarvestEffects,
    plantPlot,
    plantPlotWithSource,
    harvestPlot,
    harvestPlotWithSource,
    getFarmMetrics,
    getPlotProgress,
    getPlotEmoji,
    getPlotName,
    getPlotBadge,
    getPlotStageText,
    getPlotTimerText,
    getPlotHint,
    getPlotLabel,
  };
})(window.StrawberryFarm = window.StrawberryFarm || {});
