(function (SF) {
  function updateHelperState(game, now = Date.now()) {
    const helper = game.state.systems.helper;

    if (!helper) {
      return false;
    }

    if (!game.state.upgrades.helper) {
      game.state.systems.helper = SF.state.getInitialHelperState();
      return false;
    }

    if (!Number.isFinite(helper.nextHarvestAt)) {
      helper.nextHarvestAt = now + SF.config.upgrades.helper.harvestIntervalMs;
      return true;
    }

    return false;
  }

  function noteHelperHarvest(game, plotId, now = Date.now()) {
    game.state.systems.helper.lastHarvestAt = now;
    game.state.systems.helper.lastPlotId = plotId;
    game.state.systems.helper.lastActionAt = now;
    game.state.systems.helper.lastActionText = `Ajudante colheu o canteiro ${plotId + 1}.`;
  }

  function noteHelperPlant(game, plotId, now = Date.now()) {
    game.state.systems.helper.lastActionAt = now;
    game.state.systems.helper.lastActionText = `Ajudante plantou no canteiro ${plotId + 1}.`;
  }

  function noteHelperClean(game, plotId, now = Date.now()) {
    game.state.systems.helper.lastActionAt = now;
    game.state.systems.helper.lastActionText = `Ajudante limpou o canteiro ${plotId + 1}.`;
  }

  function runFarmHelper(game, now = Date.now()) {
    if (!game.state.upgrades.helper) {
      return false;
    }

    const helper = game.state.systems.helper;

    if (!Number.isFinite(helper.nextHarvestAt) || now < helper.nextHarvestAt) {
      return false;
    }

    helper.nextHarvestAt = now + SF.config.upgrades.helper.harvestIntervalMs;

    const readyPlot = SF.plots.getVisiblePlots(game).find((plot) => plot.state === SF.config.plotStates.ready);

    if (!readyPlot) {
      if (game.state.upgrades.helperGloves) {
        const rottenPlot = SF.plots.getVisiblePlots(game).find((plot) => plot.state === SF.config.plotStates.rotten);
        if (rottenPlot) {
          SF.plots.clearRottenPlotWithSource(game, rottenPlot, "helper", now);
          return true;
        }
      }

      if (!game.state.upgrades.helperPlanting || game.state.seeds <= 0) {
        return false;
      }

      const emptyPlot = SF.plots.getVisiblePlots(game).find((plot) => plot.state === SF.config.plotStates.empty);

      if (!emptyPlot) {
        return false;
      }

      SF.plots.plantPlotWithSource(game, emptyPlot, "helper", now);
      return true;
    }

    SF.plots.harvestPlotWithSource(game, readyPlot, "helper", now);
    return true;
  }

  SF.helper = {
    updateHelperState,
    noteHelperHarvest,
    noteHelperPlant,
    noteHelperClean,
    runFarmHelper,
  };
})(window.StrawberryFarm = window.StrawberryFarm || {});
