(function (SF) {
  const game = {
    config: SF.config,
    elements: SF.ui.collectElements(),
    storage: null,
    plotElements: [],
    runtime: {
      now: Date.now(),
    },
    debugState: {
      randomEventsEnabled: true,
      forcedMarketSteps: [],
    },
    uiState: {
      milestoneToast: null,
      harvestedPlots: {},
    },
    state: null,
    autosaveIntervalId: null,
    dirty: false,
    setMessage(message) {
      game.state.message = message;
    },
    commit(options = {}) {
      SF.runtime.commit(game, options);
    },
    handlePlotClick(plotIndex) {
      const now = Date.now();
      SF.runtime.setNow(game, now);
      const plot = game.state.plots[plotIndex];

      if (!plot || !SF.plots.isPlotUnlocked(game, plotIndex)) {
        return;
      }

      if (plot.state === SF.config.plotStates.empty) {
        SF.plots.plantPlot(game, plot, now);
        return;
      }

      if (plot.state === SF.config.plotStates.ready) {
        SF.plots.harvestPlot(game, plot, now);
        return;
      }

      if (plot.state === SF.config.plotStates.rotten) {
        SF.plots.clearRottenPlot(game, plot, now);
        return;
      }

      SF.runtime.showMessage(game, "Ainda crescendo.", { now });
    },
  };

  function init() {
    const now = Date.now();
    SF.runtime.setNow(game, now);
    game.storage = SF.state.createStorageAdapter(SF.config.storageKey);
    game.state = SF.state.loadState(game.storage, { now });
    attachEvents();
    attachDebugHelpers();
    SF.runtime.prime(game, now);
    SF.runtime.renderGame(game, "full", now);
    startTicker();
    startAutosave();
  }

  function attachEvents() {
    bindElementEvent("buySeedButton", "click", buySeed);
    bindElementEvent("sellButton", "click", sellStrawberries);
    bindElementEvent("resetButton", "click", resetGame);
    bindElementEvent("fertilizerButton", "click", buyFertilizerUpgrade);
    bindElementEvent("marketButton", "click", buyMarketUpgrade);
    bindElementEvent("expandFarmButton", "click", expandFarm);
    bindElementEvent("helperButton", "click", buyHelperUpgrade);
    bindElementEvent("prestigeButton", "click", prestigeFarm);
    bindElementEvent("helpToggleButton", "click", toggleHelpPanel);
    bindElementEvent("helpDismissButton", "click", dismissHelpPanel);
    bindElementEvent("sidebarGoalsTab", "click", () => setSidebarTab("goals"));
    bindElementEvent("sidebarUpgradesTab", "click", () => setSidebarTab("upgrades"));
    window.addEventListener("pagehide", flushAutosave);
    window.addEventListener("beforeunload", flushAutosave);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        flushAutosave();
      }
    });
  }

  function bindElementEvent(elementKey, eventName, handler) {
    const element = game.elements[elementKey];

    if (!element) {
      console.warn(`[Strawberry Farm] Elemento ausente durante bind: ${elementKey}`);
      return;
    }

    element.addEventListener(eventName, handler);
  }

  function attachDebugHelpers() {
    window.__strawberryFarmDebug = {
      forceEvent(eventId, durationMs = SF.config.events.durationMs) {
        const now = Date.now();
        SF.runtime.setNow(game, now);
        SF.events.activateEvent(game, eventId, durationMs, true, now);
        game.commit({ now });
      },
      clearEvent() {
        const now = Date.now();
        SF.runtime.setNow(game, now);
        SF.events.clearActiveEvent(game);
        game.commit({ now });
      },
      getState() {
        return JSON.parse(JSON.stringify(game.state));
      },
      setRandomEventsEnabled(enabled) {
        game.debugState.randomEventsEnabled = Boolean(enabled);
      },
      forceMilestoneToast(message) {
        const now = Date.now();
        SF.runtime.setNow(game, now);
        SF.runtime.showMilestoneToast(game, message, now);
        SF.runtime.renderGame(game, "full", now);
      },
      setState(partialState) {
        const now = Date.now();
        SF.runtime.replaceState(game, { ...game.state, ...partialState }, { hydrate: true, derive: false, now });
      },
      setForcedMarketSteps(steps) {
        game.debugState.forcedMarketSteps = Array.isArray(steps) ? [...steps] : [];
      },
    };
  }

  function maybeTriggerRandomEvent(now = Date.now()) {
    if (
      !game.debugState.randomEventsEnabled ||
      game.state.systems.activeEvent ||
      Math.random() > SF.config.events.triggerChanceOnSell
    ) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * SF.config.events.definitions.length);
    const randomEvent = SF.config.events.definitions[randomIndex];
    SF.events.activateEvent(game, randomEvent.id, SF.config.events.durationMs, false, now);
  }

  function buySeed() {
    const now = Date.now();
    SF.runtime.setNow(game, now);
    const seedPrice = SF.plots.getSeedPrice(game);

    if (game.state.money < seedPrice) {
      SF.runtime.showMessage(game, "Moedas insuficientes.", { now });
      return;
    }

    game.state.money -= seedPrice;
    game.state.seeds += 1;
    game.setMessage("1 semente comprada.");
    game.commit({ now });
  }

  function sellStrawberries() {
    const now = Date.now();
    SF.runtime.setNow(game, now);

    if (game.state.strawberries <= 0) {
      SF.runtime.showMessage(game, "Sem morangos.", { now });
      return;
    }

    const sellPrice = SF.market.getSellPrice(game);
    const marketBasePrice = SF.market.getMarketBasePrice(game);
    const quantity = game.state.strawberries;
    const baseEarnedMoney = quantity * sellPrice;
    const prestigeBonus = SF.prestige.getPrestigeSaleBonus(game, baseEarnedMoney);
    const earnedMoney = baseEarnedMoney + prestigeBonus;
    game.state.money += earnedMoney;
    game.state.strawberries = 0;
    game.state.stats.soldTotal += quantity;
    game.setMessage(
      prestigeBonus > 0
        ? `Venda: ${quantity} por ${earnedMoney}. Base ${marketBasePrice}, bônus ${prestigeBonus}.`
        : `Venda: ${quantity} por ${earnedMoney}. Base ${marketBasePrice}.`,
    );
    maybeTriggerRandomEvent(now);
    game.commit({ now });
  }

  function buyFertilizerUpgrade() {
    const now = Date.now();
    SF.runtime.setNow(game, now);
    const currentLevel = SF.upgrades.getUpgradeLevel(game, "fertilizer");
    const nextCost = SF.upgrades.getUpgradeCost("fertilizer", currentLevel);

    if (SF.upgrades.isMaxLevel(game, "fertilizer")) {
      SF.runtime.showMessage(game, "Adubo no nível máximo.", { now });
      return;
    }

    if (game.state.money < nextCost) {
      SF.runtime.showMessage(game, "Moedas insuficientes.", { now });
      return;
    }

    game.state.money -= nextCost;
    game.state.upgrades.fertilizer = currentLevel + 1;
    game.state.stats.upgradesPurchased += 1;
    game.setMessage(`Adubo melhorado para nível ${currentLevel + 1}.`);
    game.commit({ now });
  }

  function buyMarketUpgrade() {
    const now = Date.now();
    SF.runtime.setNow(game, now);
    const currentLevel = SF.upgrades.getUpgradeLevel(game, "market");
    const nextCost = SF.upgrades.getUpgradeCost("market", currentLevel);

    if (SF.upgrades.isMaxLevel(game, "market")) {
      SF.runtime.showMessage(game, "Caixa premium no nível máximo.", { now });
      return;
    }

    if (game.state.money < nextCost) {
      SF.runtime.showMessage(game, "Moedas insuficientes.", { now });
      return;
    }

    game.state.money -= nextCost;
    game.state.upgrades.market = currentLevel + 1;
    game.state.stats.upgradesPurchased += 1;
    game.setMessage(`Caixa premium nível ${currentLevel + 1}.`);
    game.commit({ now });
  }

  function buyHelperUpgrade() {
    const now = Date.now();
    SF.runtime.setNow(game, now);
    const currentLevel = SF.upgrades.getUpgradeLevel(game, "helper");
    const nextCost = SF.upgrades.getUpgradeCost("helper", currentLevel);
    const nextLevel = currentLevel + 1;

    if (SF.upgrades.isMaxLevel(game, "helper")) {
      SF.runtime.showMessage(game, "Ajudante já está no nível máximo.", { now });
      return;
    }

    if (game.state.money < nextCost) {
      SF.runtime.showMessage(game, "Moedas insuficientes.", { now });
      return;
    }

    game.state.money -= nextCost;
    game.state.upgrades.helper = nextLevel;
    game.state.stats.upgradesPurchased += 1;
    game.state.systems.helper.nextHarvestAt = now + SF.upgrades.getHelperHarvestInterval(nextLevel);
    game.state.systems.helper.lastActionAt = now;
    game.state.systems.helper.lastActionText =
      nextLevel === 1
        ? "Ajudante ativado."
        : nextLevel === 2
          ? "Bolsa de sementes integrada."
          : nextLevel === 3
            ? "Luvas Resistentes integradas."
            : `Ajudante mais rápido no nível ${nextLevel}.`;
    game.setMessage(`Ajudante nível ${nextLevel}.`);
    game.commit({ now });
  }

  function expandFarm() {
    const now = Date.now();
    SF.runtime.setNow(game, now);
    const currentFarmLevel = SF.plots.getFarmLevelConfig(game);
    const nextFarmLevel = SF.plots.getFarmLevelConfigByLevel(currentFarmLevel.level + 1);

    if (currentFarmLevel.level >= SF.config.farmLevels.length - 1) {
      SF.runtime.showMessage(game, "Fazenda já expandida.", { now });
      return;
    }

    if (game.state.money < nextFarmLevel.expansionCost) {
      SF.runtime.showMessage(game, "Moedas insuficientes.", { now });
      return;
    }

    game.state.money -= nextFarmLevel.expansionCost;
    game.state.farmLevel = nextFarmLevel.level;
    game.state.unlockedPlotCount = nextFarmLevel.unlockedPlotCount;
    game.state.hasExpandedFarm = nextFarmLevel.level > 0;
    game.setMessage(`Fazenda ${nextFarmLevel.label} liberada.`);
    game.commit({ now });
  }

  function prestigeFarm() {
    const now = Date.now();
    SF.runtime.setNow(game, now);

    if (!SF.prestige.isPrestigeAvailable(game)) {
      SF.runtime.showMessage(game, `Precisa de ${SF.prestige.getPrestigeThreshold(game)} moedas.`, { now });
      return;
    }

    const nextLevel = game.state.prestige.level + 1;
    const nextBonusPercent = SF.prestige.getPrestigeBonusPercent(game, nextLevel);
    const shouldPrestige = window.confirm(
      `Prestigiar a fazenda?\n\nVocê perderá moedas, sementes, morangos, fazenda expandida, plantações, melhorias, ajudante, evento e combo atuais.\n\nVocê ganhará Conhecimento do Morango nível ${nextLevel} com +${nextBonusPercent}% permanente no valor total das vendas.`,
    );

    if (!shouldPrestige) {
      SF.runtime.showMessage(game, "Prestígio cancelado.", { now });
      return;
    }

    const nextPrestigeState = {
      level: nextLevel,
      sellBonusMultiplier: SF.prestige.getPrestigeMultiplierForLevel(nextLevel) - 1,
    };

    SF.progression.applyProgressionGoals(game);
    const completedGoals = [...game.state.progression.completedGoalIds];

    const nextState = SF.state.createInitialState(now);
    nextState.prestige = nextPrestigeState;
    nextState.progression.completedGoalIds = completedGoals;
    nextState.systems.prestige.unlockShownForLevel = -1;
    SF.runtime.replaceState(game, nextState, {
      now,
      resetUi: true,
      message: `Conhecimento nível ${nextLevel}: +${nextBonusPercent}% venda.`,
      toast: `Prestígio ativo. Nível ${nextLevel}.`,
    });
  }

  function resetGame() {
    const now = Date.now();
    SF.runtime.setNow(game, now);
    const shouldReset = window.confirm(
      "Reiniciar todo o progresso?\n\nIsso apaga moedas, sementes, melhorias, ajudante, eventos, metas, plantações salvas e também o Conhecimento do Morango.",
    );

    if (!shouldReset) {
      SF.runtime.showMessage(game, "Reset cancelado.", { now });
      return;
    }

    SF.runtime.replaceState(game, SF.state.createInitialState(now), {
      now,
      resetUi: true,
    });
  }

  function toggleHelpPanel() {
    const now = Date.now();
    SF.runtime.setNow(game, now);
    game.state.ui.helpOpen = !game.state.ui.helpOpen;
    SF.runtime.persistAndRender(game, "full", now);
  }

  function dismissHelpPanel() {
    const now = Date.now();
    SF.runtime.setNow(game, now);
    game.state.ui.helpOpen = false;
    SF.runtime.persistAndRender(game, "full", now);
  }

  function setSidebarTab(tabId) {
    const now = Date.now();
    SF.runtime.setNow(game, now);
    game.state.ui.activeSidebarTab = ["goals", "upgrades"].includes(tabId) ? tabId : "goals";
    SF.runtime.persistAndRender(game, "full", now);
  }

  function startTicker() {
    window.setInterval(() => {
      SF.runtime.tick(game, Date.now());
    }, 250);
  }

  function startAutosave() {
    game.autosaveIntervalId = window.setInterval(() => {
      if (!game.dirty) {
        return;
      }

      const now = Date.now();
      SF.runtime.setNow(game, now);
      SF.runtime.persistAndRender(game, "full", now, {
        markDirty: false,
      });
    }, SF.config.autosaveIntervalMs);
  }

  function flushAutosave() {
    if (!game.dirty) {
      return;
    }

    const now = Date.now();
    SF.runtime.setNow(game, now);
    SF.runtime.persistAndRender(game, "none", now, {
      markDirty: false,
    });
  }

  init();
})(window.StrawberryFarm = window.StrawberryFarm || {});
