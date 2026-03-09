(function (SF) {
  const game = {
    config: SF.config,
    elements: SF.ui.collectElements(),
    storage: null,
    plotElements: [],
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
    commit() {
      SF.events.updateActiveEvent(game);
      SF.market.updateMarketState(game);
      SF.combo.updateComboState(game);
      SF.helper.updateHelperState(game);
      SF.plots.updatePlotsByTime(game);
      const goalRewards = SF.progression.applyProgressionGoals(game);
      const prestigeUnlocked = SF.progression.maybeNotifyPrestigeUnlocked(game);

      if (goalRewards.length > 0) {
        game.setMessage(goalRewards.join(" "));
        SF.render.showMilestoneToast(game, goalRewards[goalRewards.length - 1]);
      } else if (prestigeUnlocked) {
        game.setMessage(`Prestígio liberado em ${SF.prestige.getPrestigeThreshold(game)} moedas.`);
      }

      game.dirty = true;
      SF.state.saveState(game);
      SF.render.render(game);
    },
    handlePlotClick(plotIndex) {
      const plot = game.state.plots[plotIndex];

      if (!plot || plotIndex >= game.state.unlockedPlotCount) {
        return;
      }

      if (plot.state === SF.config.plotStates.empty) {
        SF.plots.plantPlot(game, plot);
        return;
      }

      if (plot.state === SF.config.plotStates.ready) {
        SF.plots.harvestPlot(game, plot);
        return;
      }

      game.setMessage("Ainda crescendo.");
      SF.render.render(game);
    },
  };

  function init() {
    game.storage = SF.state.createStorageAdapter(SF.config.storageKey);
    game.state = SF.state.loadState(game.storage);
    attachEvents();
    attachDebugHelpers();
    SF.render.render(game);
    startTicker();
    startAutosave();
  }

  function attachEvents() {
    game.elements.buySeedButton.addEventListener("click", buySeed);
    game.elements.sellButton.addEventListener("click", sellStrawberries);
    game.elements.resetButton.addEventListener("click", resetGame);
    game.elements.fertilizerButton.addEventListener("click", buyFertilizerUpgrade);
    game.elements.marketButton.addEventListener("click", buyMarketUpgrade);
    game.elements.expandFarmButton.addEventListener("click", expandFarm);
    game.elements.helperButton.addEventListener("click", buyHelperUpgrade);
    game.elements.helperPlantingButton.addEventListener("click", buyHelperPlantingUpgrade);
    game.elements.prestigeButton.addEventListener("click", prestigeFarm);
    game.elements.helpToggleButton.addEventListener("click", toggleHelpPanel);
    game.elements.helpDismissButton.addEventListener("click", dismissHelpPanel);
    window.addEventListener("pagehide", flushAutosave);
    window.addEventListener("beforeunload", flushAutosave);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        flushAutosave();
      }
    });
  }

  function attachDebugHelpers() {
    window.__strawberryFarmDebug = {
      forceEvent(eventId, durationMs = SF.config.events.durationMs) {
        SF.events.activateEvent(game, eventId, durationMs, true);
        game.dirty = true;
        SF.state.saveState(game);
        SF.render.render(game);
      },
      clearEvent() {
        SF.events.clearActiveEvent(game);
        game.dirty = true;
        SF.state.saveState(game);
        SF.render.render(game);
      },
      getState() {
        return JSON.parse(JSON.stringify(game.state));
      },
      setRandomEventsEnabled(enabled) {
        game.debugState.randomEventsEnabled = Boolean(enabled);
      },
      forceMilestoneToast(message) {
        SF.render.showMilestoneToast(game, message);
        SF.render.render(game);
      },
      setState(partialState) {
        game.state = SF.state.hydrateState({ ...game.state, ...partialState });
        game.dirty = true;
        SF.state.saveState(game);
        SF.render.render(game);
      },
      setForcedMarketSteps(steps) {
        game.debugState.forcedMarketSteps = Array.isArray(steps) ? [...steps] : [];
      },
    };
  }

  function maybeTriggerRandomEvent() {
    if (
      !game.debugState.randomEventsEnabled ||
      game.state.systems.activeEvent ||
      Math.random() > SF.config.events.triggerChanceOnSell
    ) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * SF.config.events.definitions.length);
    const randomEvent = SF.config.events.definitions[randomIndex];
    SF.events.activateEvent(game, randomEvent.id, SF.config.events.durationMs);
  }

  function buySeed() {
    const seedPrice = SF.plots.getSeedPrice(game);

    if (game.state.money < seedPrice) {
      game.setMessage("Moedas insuficientes.");
      SF.render.render(game);
      return;
    }

    game.state.money -= seedPrice;
    game.state.seeds += 1;
    game.setMessage("1 semente comprada.");
    game.commit();
  }

  function sellStrawberries() {
    if (game.state.strawberries <= 0) {
      game.setMessage("Sem morangos.");
      SF.render.render(game);
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
    maybeTriggerRandomEvent();
    game.commit();
  }

  function buyFertilizerUpgrade() {
    const currentLevel = SF.upgrades.getUpgradeLevel(game, "fertilizer");
    const nextCost = SF.upgrades.getUpgradeCost("fertilizer", currentLevel);

    if (SF.upgrades.isMaxLevel(game, "fertilizer")) {
      game.setMessage("Adubo no nivel maximo.");
      SF.render.render(game);
      return;
    }

    if (game.state.money < nextCost) {
      game.setMessage("Moedas insuficientes.");
      SF.render.render(game);
      return;
    }

    game.state.money -= nextCost;
    game.state.upgrades.fertilizer = currentLevel + 1;
    game.state.stats.upgradesPurchased += 1;
    game.setMessage(`Adubo melhorado para nivel ${currentLevel + 1}.`);
    game.commit();
  }

  function buyMarketUpgrade() {
    const currentLevel = SF.upgrades.getUpgradeLevel(game, "market");
    const nextCost = SF.upgrades.getUpgradeCost("market", currentLevel);

    if (SF.upgrades.isMaxLevel(game, "market")) {
      game.setMessage("Caixa premium no nivel maximo.");
      SF.render.render(game);
      return;
    }

    if (game.state.money < nextCost) {
      game.setMessage("Moedas insuficientes.");
      SF.render.render(game);
      return;
    }

    game.state.money -= nextCost;
    game.state.upgrades.market = currentLevel + 1;
    game.state.stats.upgradesPurchased += 1;
    game.setMessage(`Caixa premium nivel ${currentLevel + 1}.`);
    game.commit();
  }

  function buyHelperUpgrade() {
    const upgrade = SF.config.upgrades.helper;

    if (game.state.upgrades.helper) {
      game.setMessage("Helper já ativo.");
      SF.render.render(game);
      return;
    }

    if (game.state.money < upgrade.cost) {
      game.setMessage("Moedas insuficientes.");
      SF.render.render(game);
      return;
    }

    game.state.money -= upgrade.cost;
    game.state.upgrades.helper = true;
    game.state.stats.upgradesPurchased += 1;
    game.state.systems.helper.nextHarvestAt = Date.now() + upgrade.harvestIntervalMs;
    game.state.systems.helper.lastActionAt = Date.now();
    game.state.systems.helper.lastActionText = "Helper ativado.";
    game.setMessage("Helper comprado.");
    game.commit();
  }

  function buyHelperPlantingUpgrade() {
    const upgrade = SF.config.upgrades.helperPlanting;

    if (!game.state.upgrades.helper) {
      game.setMessage("Compre o Helper primeiro.");
      SF.render.render(game);
      return;
    }

    if (game.state.upgrades.helperPlanting) {
      game.setMessage("Plantio assistido ja ativo.");
      SF.render.render(game);
      return;
    }

    if (game.state.money < upgrade.cost) {
      game.setMessage("Moedas insuficientes.");
      SF.render.render(game);
      return;
    }

    game.state.money -= upgrade.cost;
    game.state.upgrades.helperPlanting = true;
    game.state.stats.upgradesPurchased += 1;
    game.state.systems.helper.lastActionAt = Date.now();
    game.state.systems.helper.lastActionText = "Plantio assistido ativado.";
    game.setMessage("Plantio assistido comprado.");
    game.commit();
  }

  function expandFarm() {
    if (game.state.hasExpandedFarm) {
      game.setMessage("Fazenda já expandida.");
      SF.render.render(game);
      return;
    }

    if (game.state.money < SF.config.expansion.cost) {
      game.setMessage("Moedas insuficientes.");
      SF.render.render(game);
      return;
    }

    game.state.money -= SF.config.expansion.cost;
    game.state.unlockedPlotCount = SF.config.maxPlotCount;
    game.state.hasExpandedFarm = true;
    game.setMessage("Fazenda 4x4 liberada.");
    game.commit();
  }

  function prestigeFarm() {
    if (!SF.prestige.isPrestigeAvailable(game)) {
      game.setMessage(`Precisa de ${SF.prestige.getPrestigeThreshold(game)} moedas.`);
      SF.render.render(game);
      return;
    }

    const nextLevel = game.state.prestige.level + 1;
    const nextBonusPercent = SF.prestige.getPrestigeBonusPercent(game, nextLevel);
    const shouldPrestige = window.confirm(
      `Prestigiar a fazenda?\n\nVocê perderá moedas, sementes, morangos, fazenda expandida, plantações, upgrades, helper, evento e combo atuais.\n\nVocê ganhará Strawberry Knowledge nível ${nextLevel} com +${nextBonusPercent}% permanente no valor total das vendas.`,
    );

    if (!shouldPrestige) {
      game.setMessage("Prestígio cancelado.");
      SF.render.render(game);
      return;
    }

    const nextPrestigeState = {
      level: nextLevel,
      sellBonusMultiplier: SF.prestige.getPrestigeMultiplierForLevel(nextLevel) - 1,
    };

    game.state = SF.state.createInitialState();
    game.state.prestige = nextPrestigeState;
    game.state.systems.prestige.unlockShownForLevel = -1;
    game.state.message = `Conhecimento nível ${nextLevel}: +${nextBonusPercent}% venda.`;
    game.uiState.milestoneToast = null;
    SF.render.showMilestoneToast(game, `Prestígio ativo. Nível ${nextLevel}.`);
    SF.state.saveState(game);
    SF.render.render(game);
  }

  function resetGame() {
    const shouldReset = window.confirm(
      "Reiniciar todo o progresso?\n\nIsso apaga moedas, sementes, upgrades, helper, eventos, metas, plantações salvas e também o Strawberry Knowledge.",
    );

    if (!shouldReset) {
      game.setMessage("Reset cancelado.");
      SF.render.render(game);
      return;
    }

    game.state = SF.state.createInitialState();
    game.uiState.milestoneToast = null;
    SF.state.saveState(game);
    SF.render.render(game);
  }

  function toggleHelpPanel() {
    game.state.ui.helpOpen = !game.state.ui.helpOpen;
    game.dirty = true;
    SF.state.saveState(game);
    SF.render.render(game);
  }

  function dismissHelpPanel() {
    game.state.ui.helpOpen = false;
    game.dirty = true;
    SF.state.saveState(game);
    SF.render.render(game);
  }

  function startTicker() {
    window.setInterval(() => {
      const eventEnded = SF.events.updateActiveEvent(game);
      const marketChanged = SF.market.updateMarketState(game);
      const comboExpired = SF.combo.updateComboState(game);
      const plotsReady = SF.plots.updatePlotsByTime(game);
      const helperHarvested = SF.helper.runFarmHelper(game);
      SF.plots.syncHarvestEffects(game);

      if (eventEnded) {
        game.setMessage("Evento encerrado.");
        game.dirty = true;
        SF.render.render(game);
        return;
      }

      if (marketChanged) {
        game.setMessage(SF.market.getMarketUpdateMessage(game));
        game.dirty = true;
        SF.render.render(game);
        return;
      }

      if (helperHarvested) {
        return;
      }

      if (comboExpired) {
        SF.render.renderLiveState(game);
        return;
      }

      if (plotsReady) {
        game.setMessage("Há morangos prontos.");
        game.dirty = true;
        SF.render.render(game);
        return;
      }

      SF.render.renderLiveState(game);
    }, 250);
  }

  function startAutosave() {
    game.autosaveIntervalId = window.setInterval(() => {
      if (!game.dirty) {
        return;
      }

      SF.state.saveState(game);
      SF.render.render(game);
    }, SF.config.autosaveIntervalMs);
  }

  function flushAutosave() {
    if (!game.dirty) {
      return;
    }

    SF.state.saveState(game);
  }

  init();
})(window.StrawberryFarm = window.StrawberryFarm || {});
