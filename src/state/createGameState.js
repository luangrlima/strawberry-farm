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

  function createInitialState(now = Date.now()) {
    const config = SF.config;

    return {
      money: config.startingState.money,
      seeds: config.startingState.seeds,
      strawberries: config.startingState.strawberries,
      unlockedPlotCount: config.initialPlotCount,
      farmLevel: 0,
      hasExpandedFarm: false,
      upgrades: {
        fertilizer: 0,
        market: 0,
        helper: false,
        helperPlanting: false,
        helperGloves: false,
      },
      progression: {
        completedGoalIds: [],
      },
      ui: {
        helpOpen: false,
        activeSidebarTab: "goals",
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
          nextUpdateAt: now + config.market.updateIntervalMs,
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
        rottenAt: null,
        growthDurationMs: null,
        spoilDurationMs: null,
      })),
    };
  }

  SF.state.getInitialPrestigeState = getInitialPrestigeState;
  SF.state.getInitialHelperState = getInitialHelperState;
  SF.state.createInitialState = createInitialState;
})(window.StrawberryFarm = window.StrawberryFarm || {});
