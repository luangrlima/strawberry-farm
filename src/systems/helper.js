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
      return false;
    }

    SF.plots.harvestPlotWithSource(game, readyPlot, "helper");
    return true;
  }

  SF.helper = {
    updateHelperState,
    noteHelperHarvest,
    runFarmHelper,
  };
})(window.StrawberryFarm = window.StrawberryFarm || {});
