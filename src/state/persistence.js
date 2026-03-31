(function (SF) {
  SF.state = SF.state || {};
  const SAVE_VERSION = 2;

  function createStorageAdapter(storageKey) {
    try {
      const testKey = `${storageKey}-test`;
      window.localStorage.setItem(testKey, "ok");
      window.localStorage.removeItem(testKey);

      return {
        isPersistent: true,
        getItem(key) {
          return window.localStorage.getItem(key);
        },
        setItem(key, value) {
          window.localStorage.setItem(key, value);
        },
      };
    } catch {
      const memoryStorage = new Map();

      return {
        isPersistent: false,
        getItem(key) {
          return memoryStorage.has(key) ? memoryStorage.get(key) : null;
        },
        setItem(key, value) {
          memoryStorage.set(key, value);
        },
      };
    }
  }

  function getHydrationNow(options = {}) {
    return Number.isFinite(options.now) ? options.now : Date.now();
  }

  function serializeState(state) {
    return {
      ...state,
      saveVersion: SAVE_VERSION,
    };
  }

  function hydrateState(savedState, options = {}) {
    const config = SF.config;
    const now = getHydrationNow(options);
    const nextState = SF.state.createInitialState(now);

    nextState.money = Number.isFinite(savedState.money) ? savedState.money : nextState.money;
    nextState.seeds = Number.isFinite(savedState.seeds) ? savedState.seeds : nextState.seeds;
    nextState.strawberries = Number.isFinite(savedState.strawberries)
      ? savedState.strawberries
      : nextState.strawberries;
    nextState.message = typeof savedState.message === "string" ? savedState.message : nextState.message;

    const savedSystems = savedState.systems && typeof savedState.systems === "object" ? savedState.systems : null;
    nextState.systems.lastSavedAt = Number.isFinite(savedSystems?.lastSavedAt)
      ? savedSystems.lastSavedAt
      : Number.isFinite(savedState.lastSavedAt)
        ? savedState.lastSavedAt
        : null;
    const savedUnlockedPlotCount = Number.isFinite(savedState.unlockedPlotCount)
      ? Math.max(config.initialPlotCount, Math.min(config.maxPlotCount, savedState.unlockedPlotCount))
      : nextState.unlockedPlotCount;
    const derivedFarmLevel = Number.isFinite(savedState.farmLevel)
      ? Math.max(0, Math.min(config.farmLevels.length - 1, savedState.farmLevel))
      : SF.plots.getFarmLevelIndexByUnlockedPlotCount(
          Boolean(savedState.hasExpandedFarm) && savedUnlockedPlotCount < config.maxPlotCount
            ? config.farmLevels[1].unlockedPlotCount
            : savedUnlockedPlotCount,
        );
    const farmLevelConfig = config.farmLevels[derivedFarmLevel];
    nextState.farmLevel = derivedFarmLevel;
    nextState.unlockedPlotCount = farmLevelConfig.unlockedPlotCount;
    nextState.hasExpandedFarm = derivedFarmLevel > 0;

    const savedActiveEvent = savedSystems?.activeEvent || savedState.activeEvent;
    if (savedActiveEvent && typeof savedActiveEvent === "object") {
      const eventDefinition = SF.events.getEventDefinition(savedActiveEvent.id);

      if (eventDefinition && Number.isFinite(savedActiveEvent.endsAt)) {
        nextState.systems.activeEvent = {
          id: eventDefinition.id,
          endsAt: savedActiveEvent.endsAt,
          durationMs: Number.isFinite(savedActiveEvent.durationMs)
            ? savedActiveEvent.durationMs
            : config.events.durationMs,
        };
      }
    }

    const savedCombo = savedSystems?.combo || savedState.combo;
    if (savedCombo && typeof savedCombo === "object") {
      nextState.systems.combo.count = Number.isFinite(savedCombo.count) ? Math.max(0, savedCombo.count) : 0;
      nextState.systems.combo.lastHarvestAt = Number.isFinite(savedCombo.lastHarvestAt) ? savedCombo.lastHarvestAt : null;
      nextState.systems.combo.expiresAt = Number.isFinite(savedCombo.expiresAt) ? savedCombo.expiresAt : null;
      nextState.systems.combo.lastRewardedThreshold = Number.isFinite(savedCombo.lastRewardedThreshold)
        ? savedCombo.lastRewardedThreshold
        : 0;
      nextState.systems.combo.rewardMoney = Number.isFinite(savedCombo.rewardMoney) ? savedCombo.rewardMoney : 0;
    }

    const savedMarket = savedSystems?.market || savedState.market;
    if (savedMarket && typeof savedMarket === "object") {
      const nextPrice = SF.market.normalizeMarketPrice(savedMarket.currentPrice);
      nextState.systems.market.currentPrice = nextPrice;
      nextState.systems.market.previousPrice = SF.market.normalizeMarketPrice(savedMarket.previousPrice ?? nextPrice);
      nextState.systems.market.direction = SF.market.getMarketDirection(
        nextState.systems.market.currentPrice,
        nextState.systems.market.previousPrice,
      );
      nextState.systems.market.nextUpdateAt = Number.isFinite(savedMarket.nextUpdateAt)
        ? savedMarket.nextUpdateAt
        : now + config.market.updateIntervalMs;
    }

    if (savedState.upgrades && typeof savedState.upgrades === "object") {
      nextState.upgrades.fertilizer = SF.upgrades.normalizeLeveledUpgradeValue(
        savedState.upgrades.fertilizer,
        config.upgrades.fertilizer.maxLevel,
      );
      nextState.upgrades.market = SF.upgrades.normalizeLeveledUpgradeValue(
        savedState.upgrades.market,
        config.upgrades.market.maxLevel,
      );
      const savedHelperLevel = savedState.upgrades.helper;
      const legacyHelperActive = Boolean(savedState.upgrades.helper);
      const legacyHelperPlanting = Boolean(savedState.upgrades.helperPlanting);
      const legacyHelperGloves = Boolean(savedState.upgrades.helperGloves);
      nextState.upgrades.helper = Number.isFinite(savedHelperLevel)
        ? SF.upgrades.normalizeLeveledUpgradeValue(savedHelperLevel, config.upgrades.helper.maxLevel)
        : legacyHelperGloves
          ? 3
          : legacyHelperPlanting
            ? 2
            : legacyHelperActive
              ? 1
              : 0;
    }

    if (savedState.progression && Array.isArray(savedState.progression.completedGoalIds)) {
      nextState.progression.completedGoalIds = savedState.progression.completedGoalIds.filter((goalId) =>
        config.progressionGoals.some((goal) => goal.id === goalId),
      );
    }

    if (savedState.ui && typeof savedState.ui === "object") {
      nextState.ui.helpOpen = typeof savedState.ui.helpOpen === "boolean" ? savedState.ui.helpOpen : nextState.ui.helpOpen;
      nextState.ui.activeSidebarTab = ["goals", "upgrades"].includes(savedState.ui.activeSidebarTab)
        ? savedState.ui.activeSidebarTab
        : nextState.ui.activeSidebarTab;
    }

    if (savedState.stats && typeof savedState.stats === "object") {
      nextState.stats.harvestedTotal = Number.isFinite(savedState.stats.harvestedTotal)
        ? savedState.stats.harvestedTotal
        : nextState.stats.harvestedTotal;
      nextState.stats.soldTotal = Number.isFinite(savedState.stats.soldTotal)
        ? savedState.stats.soldTotal
        : nextState.stats.soldTotal;
      nextState.stats.upgradesPurchased = Number.isFinite(savedState.stats.upgradesPurchased)
        ? savedState.stats.upgradesPurchased
        : nextState.stats.upgradesPurchased;
      nextState.stats.eventsTriggered = Number.isFinite(savedState.stats.eventsTriggered)
        ? savedState.stats.eventsTriggered
        : nextState.stats.eventsTriggered;
    }

    if (savedState.prestige && typeof savedState.prestige === "object") {
      nextState.prestige.level = Number.isFinite(savedState.prestige.level)
        ? Math.max(0, savedState.prestige.level)
        : 0;
      nextState.prestige.sellBonusMultiplier = Number.isFinite(savedState.prestige.sellBonusMultiplier)
        ? Math.max(0, savedState.prestige.sellBonusMultiplier)
        : SF.prestige.getPrestigeMultiplierForLevel(nextState.prestige.level) - 1;
    }

    const savedPrestigeSystem = savedSystems?.prestige || savedState.prestigeSystem;
    if (savedPrestigeSystem && typeof savedPrestigeSystem === "object") {
      nextState.systems.prestige.unlockShownForLevel = Number.isFinite(savedPrestigeSystem.unlockShownForLevel)
        ? savedPrestigeSystem.unlockShownForLevel
        : -1;
    }

    const savedHelper = savedSystems?.helper || savedState.helper;
    if (savedHelper && typeof savedHelper === "object") {
      nextState.systems.helper.nextHarvestAt = Number.isFinite(savedHelper.nextHarvestAt)
        ? savedHelper.nextHarvestAt
        : null;
      nextState.systems.helper.lastHarvestAt = Number.isFinite(savedHelper.lastHarvestAt)
        ? savedHelper.lastHarvestAt
        : null;
      nextState.systems.helper.lastPlotId = Number.isFinite(savedHelper.lastPlotId) ? savedHelper.lastPlotId : null;
      nextState.systems.helper.lastActionAt = Number.isFinite(savedHelper.lastActionAt) ? savedHelper.lastActionAt : null;
      nextState.systems.helper.lastActionText =
        typeof savedHelper.lastActionText === "string" ? savedHelper.lastActionText : "";
    }

    if (Array.isArray(savedState.plots)) {
      nextState.plots = nextState.plots.map((plot, index) => {
        const savedPlot = savedState.plots[index];

        if (!savedPlot) {
          return plot;
        }

        const plotState = Object.values(config.plotStates).includes(savedPlot.state)
          ? savedPlot.state
          : config.plotStates.empty;

        return {
          ...plot,
          state: plotState,
          plantedAt: Number.isFinite(savedPlot.plantedAt) ? savedPlot.plantedAt : null,
          readyAt: Number.isFinite(savedPlot.readyAt) ? savedPlot.readyAt : null,
          rottenAt: Number.isFinite(savedPlot.rottenAt) ? savedPlot.rottenAt : null,
          growthDurationMs: Number.isFinite(savedPlot.growthDurationMs) ? savedPlot.growthDurationMs : null,
          spoilDurationMs: Number.isFinite(savedPlot.spoilDurationMs) ? savedPlot.spoilDurationMs : null,
        };
      });
    }

    SF.events.updateActiveEvent({ state: nextState }, now);
    SF.market.updateMarketState({ state: nextState, debugState: { forcedMarketSteps: [] } }, now);
    SF.combo.updateComboState({ state: nextState }, now);
    SF.helper.updateHelperState({ state: nextState, config }, now);
    SF.plots.updatePlotsByTime({ state: nextState, config }, now);
    return nextState;
  }

  function loadState(storage, options = {}) {
    const now = getHydrationNow(options);
    const saved = storage.getItem(SF.config.storageKey);

    if (!saved) {
      const initialState = SF.state.createInitialState(now);

      if (!storage.isPersistent) {
        initialState.message =
          "Seu navegador bloqueou o salvamento local neste arquivo. O jogo funciona, mas sem salvar progresso.";
      }

      return initialState;
    }

    try {
      return hydrateState(JSON.parse(saved), { now });
    } catch {
      return SF.state.createInitialState(now);
    }
  }

  function saveState(game, now = Date.now()) {
    game.state.systems.lastSavedAt = now;
    game.storage.setItem(SF.config.storageKey, JSON.stringify(serializeState(game.state)));
    game.dirty = false;
  }

  SF.state.SAVE_VERSION = SAVE_VERSION;
  SF.state.createStorageAdapter = createStorageAdapter;
  SF.state.serializeState = serializeState;
  SF.state.hydrateState = hydrateState;
  SF.state.loadState = loadState;
  SF.state.saveState = saveState;
})(window.StrawberryFarm = window.StrawberryFarm || {});
