(function (SF) {
  SF.state = SF.state || {};

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

  function hydrateState(savedState) {
    const config = SF.config;
    const nextState = SF.state.createInitialState();

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
    nextState.unlockedPlotCount = Number.isFinite(savedState.unlockedPlotCount)
      ? Math.max(config.initialPlotCount, Math.min(config.maxPlotCount, savedState.unlockedPlotCount))
      : nextState.unlockedPlotCount;
    nextState.hasExpandedFarm = Boolean(savedState.hasExpandedFarm) || nextState.unlockedPlotCount === config.maxPlotCount;

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
        : Date.now() + config.market.updateIntervalMs;
    }

    if (savedState.upgrades && typeof savedState.upgrades === "object") {
      nextState.upgrades.fertilizer = Boolean(savedState.upgrades.fertilizer);
      nextState.upgrades.market = Boolean(savedState.upgrades.market);
      nextState.upgrades.helper = Boolean(savedState.upgrades.helper);
      nextState.upgrades.helperPlanting = Boolean(savedState.upgrades.helperPlanting);
    }

    if (savedState.progression && Array.isArray(savedState.progression.completedGoalIds)) {
      nextState.progression.completedGoalIds = savedState.progression.completedGoalIds.filter((goalId) =>
        config.progressionGoals.some((goal) => goal.id === goalId),
      );
    }

    if (savedState.ui && typeof savedState.ui === "object") {
      nextState.ui.helpOpen = typeof savedState.ui.helpOpen === "boolean" ? savedState.ui.helpOpen : nextState.ui.helpOpen;
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
          growthDurationMs: Number.isFinite(savedPlot.growthDurationMs) ? savedPlot.growthDurationMs : null,
        };
      });
    }

    SF.events.updateActiveEvent({ state: nextState });
    SF.market.updateMarketState({ state: nextState, debugState: { forcedMarketSteps: [] } });
    SF.combo.updateComboState({ state: nextState });
    SF.helper.updateHelperState({ state: nextState, config });
    SF.plots.updatePlotsByTime({ state: nextState, config });
    return nextState;
  }

  function loadState(storage) {
    const saved = storage.getItem(SF.config.storageKey);

    if (!saved) {
      const initialState = SF.state.createInitialState();

      if (!storage.isPersistent) {
        initialState.message =
          "Seu navegador bloqueou o salvamento local neste arquivo. O jogo funciona, mas sem salvar progresso.";
      }

      return initialState;
    }

    try {
      return hydrateState(JSON.parse(saved));
    } catch {
      return SF.state.createInitialState();
    }
  }

  function saveState(game) {
    game.state.systems.lastSavedAt = Date.now();
    game.storage.setItem(SF.config.storageKey, JSON.stringify(game.state));
    game.dirty = false;
    SF.render.renderSaveStatus(game);
  }

  SF.state.createStorageAdapter = createStorageAdapter;
  SF.state.hydrateState = hydrateState;
  SF.state.loadState = loadState;
  SF.state.saveState = saveState;
})(window.StrawberryFarm = window.StrawberryFarm || {});
