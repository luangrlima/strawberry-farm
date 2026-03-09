(function (SF) {
  SF.state = SF.state || {};

  function getInitialPrestigeState() {
    return {
      level: 0,
      sellBonusMultiplier: 0,
    };
  }

  function getInitialHelperState() {
    return {
      nextHarvestAt: null,
      lastHarvestAt: null,
      lastPlotId: null,
      lastActionAt: null,
      lastActionText: "",
    };
  }

  function createInitialState() {
    const config = SF.config;

    return {
      money: config.startingState.money,
      seeds: config.startingState.seeds,
      strawberries: config.startingState.strawberries,
      unlockedPlotCount: config.initialPlotCount,
      hasExpandedFarm: false,
      upgrades: {
        fertilizer: false,
        market: false,
        helper: false,
        helperPlanting: false,
      },
      progression: {
        completedGoalIds: [],
      },
      ui: {
        helpOpen: false,
      },
      stats: {
        harvestedTotal: 0,
        soldTotal: 0,
        upgradesPurchased: 0,
        eventsTriggered: 0,
      },
      prestige: getInitialPrestigeState(),
      systems: {
        activeEvent: null,
        market: {
          currentPrice: config.market.basePrice,
          previousPrice: config.market.basePrice,
          direction: "steady",
          nextUpdateAt: Date.now() + config.market.updateIntervalMs,
        },
        combo: {
          count: 0,
          lastHarvestAt: null,
          expiresAt: null,
          lastRewardedThreshold: 0,
          rewardMoney: 0,
        },
        helper: getInitialHelperState(),
        prestige: {
          unlockShownForLevel: -1,
        },
        lastSavedAt: null,
      },
      message: "Comece plantando.",
      plots: Array.from({ length: config.maxPlotCount }, (_, index) => ({
        id: index,
        state: config.plotStates.empty,
        plantedAt: null,
        readyAt: null,
        growthDurationMs: null,
      })),
    };
  }

  SF.state.getInitialPrestigeState = getInitialPrestigeState;
  SF.state.getInitialHelperState = getInitialHelperState;
  SF.state.createInitialState = createInitialState;
})(window.StrawberryFarm = window.StrawberryFarm || {});
