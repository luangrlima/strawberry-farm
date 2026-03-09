(function (SF) {
  function updateHelperState(game) {
    const helper = game.state.systems.helper;

    if (!helper) {
      return false;
    }

    if (!game.state.upgrades.helper) {
      game.state.systems.helper = SF.state.getInitialHelperState();
      return false;
    }

    if (!Number.isFinite(helper.nextHarvestAt)) {
      helper.nextHarvestAt = Date.now() + SF.config.upgrades.helper.harvestIntervalMs;
      return true;
    }

    return false;
  }

  function noteHelperHarvest(game, plotId) {
    game.state.systems.helper.lastHarvestAt = Date.now();
    game.state.systems.helper.lastPlotId = plotId;
    game.state.systems.helper.lastActionAt = Date.now();
    game.state.systems.helper.lastActionText = `Helper colheu o canteiro ${plotId + 1}.`;
  }

  function noteHelperPlant(game, plotId) {
    game.state.systems.helper.lastActionAt = Date.now();
    game.state.systems.helper.lastActionText = `Helper plantou no canteiro ${plotId + 1}.`;
  }

  function runFarmHelper(game) {
    if (!game.state.upgrades.helper) {
      return false;
    }

    updateHelperState(game);

    const helper = game.state.systems.helper;

    if (!Number.isFinite(helper.nextHarvestAt) || Date.now() < helper.nextHarvestAt) {
      return false;
    }

    helper.nextHarvestAt = Date.now() + SF.config.upgrades.helper.harvestIntervalMs;

    const readyPlot = SF.plots.getVisiblePlots(game).find((plot) => plot.state === SF.config.plotStates.ready);

    if (!readyPlot) {
      if (!game.state.upgrades.helperPlanting || game.state.seeds <= 0) {
        return false;
      }

      const emptyPlot = SF.plots.getVisiblePlots(game).find((plot) => plot.state === SF.config.plotStates.empty);

      if (!emptyPlot) {
        return false;
      }

      SF.plots.plantPlotWithSource(game, emptyPlot, "helper");
      return true;
    }

    SF.plots.harvestPlotWithSource(game, readyPlot, "helper");
    return true;
  }

  SF.helper = {
    updateHelperState,
    noteHelperHarvest,
    noteHelperPlant,
    runFarmHelper,
  };
})(window.StrawberryFarm = window.StrawberryFarm || {});
