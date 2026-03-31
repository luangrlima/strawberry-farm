(function (SF) {
  SF.render = SF.render || {};

  function getRenderNow(game, now) {
    if (Number.isFinite(now)) {
      return now;
    }

    if (game && game.runtime && Number.isFinite(game.runtime.now)) {
      return game.runtime.now;
    }

    return 0;
  }

  function render(game, now = getRenderNow(game)) {
    const farmMetrics = SF.plots.getFarmMetrics(game);
    renderStaticState(game, now);
    renderLiveState(game, farmMetrics, now);
  }

  function renderStaticState(game, now = getRenderNow(game)) {
    const { elements, state } = game;

    document.title = SF.config.title;
    elements.moneyCount.textContent = String(state.money);
    elements.seedCount.textContent = String(state.seeds);
    elements.berryCount.textContent = String(state.strawberries);
    elements.sellPriceValue.textContent = `${SF.market.getSellPrice(game)} moedas`;
    elements.sellPriceHint.textContent = SF.market.getSellPriceHint(game);
    elements.growthTimeValue.textContent = SF.utils.formatSeconds(SF.plots.getGrowthTimeMs(game));
    elements.plotCountValue.textContent = `${state.unlockedPlotCount}/${SF.config.maxPlotCount}`;
    elements.statusMessage.textContent = state.message;
    renderSaveStatus(game);
    renderGoalStatus(game);
    renderStatHighlights(game);
    renderPrimaryActions(game);
    renderHelperCard(game, now);
    renderPrestigeCard(game);
    renderPrestigePanel(game);
    renderHelpPanel(game);
    renderSidebarTabs(game);
    renderUpgradeCards(game);
    renderProgression(game);
  }

  function renderLiveState(game, farmMetrics = SF.plots.getFarmMetrics(game), now = getRenderNow(game)) {
    renderHelperCard(game, now);
    renderProgressIndicators(game, farmMetrics);
    renderComboStrip(game, now);
    renderHelperStrip(game, now);
    renderMilestoneToast(game, now);
    renderEventBanner(game, now);
    renderMarketBanner(game, now);
    SF.ui.renderFarmGrid(game, farmMetrics, now);
  }

  function renderGoalStatus(game) {
    const hasWon = game.state.progression.completedGoalIds.includes("reach-35");
    game.elements.goalStatus.textContent = hasWon
      ? "Meta concluída"
      : `Meta ${SF.config.winMoney}`;
    game.elements.goalStatus.classList.toggle("goal--won", hasWon);
  }

  function renderSaveStatus(game) {
    game.elements.saveStatus.textContent = getSaveStatusText(game);
  }

  function renderPrimaryActions(game) {
    const { elements, state } = game;
    const seedPrice = SF.plots.getSeedPrice(game);
    const activeEvent = SF.events.getActiveEventDefinition(game);
    const marketBasePrice = SF.market.getMarketBasePrice(game);
    const fertilizerLevel = SF.upgrades.getUpgradeLevel(game, "fertilizer");
    const marketLevel = SF.upgrades.getUpgradeLevel(game, "market");
    const currentFarmLevel = SF.plots.getFarmLevelConfig(game);
    const nextFarmLevel = SF.plots.getFarmLevelConfigByLevel(currentFarmLevel.level + 1);
    const farmAtMaxLevel = currentFarmLevel.level >= SF.config.farmLevels.length - 1;
    const nextFertilizerCost = SF.upgrades.getUpgradeCost("fertilizer", fertilizerLevel);
    const nextMarketCost = SF.upgrades.getUpgradeCost("market", marketLevel);

    elements.buySeedButton.disabled = state.money < seedPrice;
    elements.buySeedButton.textContent = `Semente (${seedPrice})`;
    elements.sellButton.disabled = state.strawberries <= 0;
    elements.sellButton.textContent = "Vender lote";
    elements.fertilizerButton.disabled =
      SF.upgrades.isMaxLevel(game, "fertilizer") || state.money < nextFertilizerCost;
    elements.marketButton.disabled = SF.upgrades.isMaxLevel(game, "market") || state.money < nextMarketCost;
    elements.expandFarmButton.disabled = farmAtMaxLevel || state.money < nextFarmLevel.expansionCost;
    elements.helperButton.disabled = state.upgrades.helper || state.money < SF.config.upgrades.helper.cost;
    elements.helperPlantingButton.disabled =
      !state.upgrades.helper ||
      state.upgrades.helperPlanting ||
      state.money < SF.config.upgrades.helperPlanting.cost;

    elements.fertilizerButton.textContent = SF.upgrades.isMaxLevel(game, "fertilizer")
      ? "Nível máximo"
      : fertilizerLevel > 0
        ? `Nível ${fertilizerLevel + 1} · ${nextFertilizerCost}`
        : `Comprar · ${nextFertilizerCost}`;
    elements.marketButton.textContent = SF.upgrades.isMaxLevel(game, "market")
      ? "Nível máximo"
      : marketLevel > 0
        ? `Nível ${marketLevel + 1} · ${nextMarketCost}`
        : `Comprar · ${nextMarketCost}`;
    elements.expandFarmButton.textContent = farmAtMaxLevel
      ? `${currentFarmLevel.label} ativa`
      : `Comprar ${nextFarmLevel.label} · ${nextFarmLevel.expansionCost}`;
    elements.helperButton.textContent = state.upgrades.helper
      ? "Ajudante ativo"
      : `Comprar · ${SF.config.upgrades.helper.cost}`;
    elements.helperPlantingButton.textContent = state.upgrades.helperPlanting
      ? "Suporte ativo"
      : state.upgrades.helper
        ? `Comprar · ${SF.config.upgrades.helperPlanting.cost}`
        : `Exige ajudante · ${SF.config.upgrades.helperPlanting.cost}`;

    elements.helperGlovesButton.disabled =
      !state.upgrades.helper ||
      state.upgrades.helperGloves ||
      state.money < SF.config.upgrades.helperGloves.cost;
    elements.helperGlovesButton.textContent = state.upgrades.helperGloves
      ? "Luvas ativas"
      : state.upgrades.helper
        ? `Comprar · ${SF.config.upgrades.helperGloves.cost}`
        : `Exige ajudante · ${SF.config.upgrades.helperGloves.cost}`;
    elements.helperGlovesButton.classList.toggle("action-btn--highlight", state.upgrades.helperGloves);

    elements.buySeedButton.classList.toggle("action-btn--highlight", Boolean(activeEvent?.seedPriceDiscount));
    elements.sellButton.classList.toggle(
      "action-btn--highlight",
      Boolean(activeEvent?.sellPriceBonus) || marketBasePrice >= SF.config.market.maxPrice,
    );
    elements.fertilizerButton.classList.toggle("action-btn--highlight", Boolean(activeEvent?.growthMultiplier));
    elements.helperButton.classList.toggle("action-btn--highlight", state.upgrades.helper);
    elements.helperPlantingButton.classList.toggle("action-btn--highlight", state.upgrades.helperPlanting);
  }

  function renderUpgradeCards(game) {
    const activeEvent = SF.events.getActiveEventDefinition(game);
    const fertilizerLevel = SF.upgrades.getUpgradeLevel(game, "fertilizer");
    const marketLevel = SF.upgrades.getUpgradeLevel(game, "market");
    const currentFarmLevel = SF.plots.getFarmLevelConfig(game);
    const nextFarmLevel = SF.plots.getFarmLevelConfigByLevel(currentFarmLevel.level + 1);
    const farmAtMaxLevel = currentFarmLevel.level >= SF.config.farmLevels.length - 1;
    const maxFertilizerLevel = SF.config.upgrades.fertilizer.maxLevel;
    const maxMarketLevel = SF.config.upgrades.market.maxLevel;
    const currentGrowthTime = SF.utils.formatSeconds(SF.plots.getGrowthTimeMs(game));
    const nextFertilizerLevel = Math.min(maxFertilizerLevel, fertilizerLevel + 1);
    const nextFertilizerReduction = SF.upgrades.getFertilizerReductionPercent(nextFertilizerLevel);
    const currentMarketBonus = SF.upgrades.getMarketSellBonus(marketLevel);
    const nextMarketLevel = Math.min(maxMarketLevel, marketLevel + 1);
    const nextMarketBonus = SF.upgrades.getMarketSellBonus(nextMarketLevel);

    game.elements.fertilizerLevelMeta.textContent = `Nível ${fertilizerLevel}/${maxFertilizerLevel}`;
    game.elements.marketLevelMeta.textContent = `Nível ${marketLevel}/${maxMarketLevel}`;
    game.elements.fertilizerDescription.textContent =
      fertilizerLevel > 0
        ? SF.upgrades.isMaxLevel(game, "fertilizer")
          ? `Tempo atual ${currentGrowthTime}. Redução total de ${SF.upgrades.getFertilizerReductionPercent(fertilizerLevel)}%.`
          : `Tempo atual ${currentGrowthTime}. Próximo nível deixa em -${nextFertilizerReduction}% do tempo base.`
        : SF.config.upgrades.fertilizer.description;
    game.elements.marketDescription.textContent =
      marketLevel > 0
        ? SF.upgrades.isMaxLevel(game, "market")
          ? `${SF.market.getSellPrice(game)} moedas por venda. Bônus total +${currentMarketBonus}.${game.state.prestige.level > 0 ? ` Prestígio +${SF.prestige.getPrestigeBonusPercent(game)}%.` : activeEvent?.sellPriceBonus ? " Evento somado." : ""}`
          : `${SF.market.getSellPrice(game)} moedas por venda. Bônus atual +${currentMarketBonus}; próximo nível vai para +${nextMarketBonus}.`
        : SF.config.upgrades.market.description;
    game.elements.expansionDescription.textContent = farmAtMaxLevel
      ? "16 lotes liberados."
      : `Atual ${currentFarmLevel.label} (${currentFarmLevel.unlockedPlotCount}/16). Próximo ${nextFarmLevel.label} por ${nextFarmLevel.expansionCost} moedas.`;
    game.elements.helperDescription.textContent = game.state.upgrades.helper
      ? game.state.upgrades.helperPlanting
        ? `Colhe 1 pronto e planta se sobrar ciclo a cada ${SF.utils.formatSeconds(SF.config.upgrades.helper.harvestIntervalMs)}.`
        : `Colhe 1 pronto a cada ${SF.utils.formatSeconds(SF.config.upgrades.helper.harvestIntervalMs)}.`
      : SF.config.upgrades.helper.description;
    game.elements.helperPlantingDescription.textContent = game.state.upgrades.helperPlanting
      ? "Ativo: usa 1 semente quando sobra um ciclo sem colheita."
      : SF.config.upgrades.helperPlanting.description;
    game.elements.helperGlovesDescription.textContent = game.state.upgrades.helperGloves
      ? `Limpeza automática. Apodrecimento em ${SF.utils.formatSeconds(10000)}.`
      : SF.config.upgrades.helperGloves.description;
  }

  function renderEventBanner(game, now = getRenderNow(game)) {
    const activeEvent = SF.events.getActiveEventDefinition(game);

    if (!activeEvent || !game.state.systems.activeEvent) {
      game.elements.eventBanner.className = "event-banner event-banner--idle";
      game.elements.eventTitle.textContent = "Sem evento";
      game.elements.eventDescription.textContent = "Pode surgir nas vendas.";
      game.elements.eventEffect.textContent = "Sem bônus.";
      game.elements.eventTags.hidden = true;
      game.elements.eventTags.innerHTML = "";
      game.elements.eventTimer.textContent = "Em espera";
      game.elements.eventProgressBar.style.width = "0%";
      return;
    }

    const remainingMs = Math.max(0, game.state.systems.activeEvent.endsAt - now);
    const totalDurationMs = SF.events.getEventDurationMs(game, activeEvent);
    const progressPercent = totalDurationMs > 0 ? (remainingMs / totalDurationMs) * 100 : 0;
    game.elements.eventBanner.className = `event-banner ${activeEvent.accentClass}`;
    game.elements.eventTitle.textContent = activeEvent.title;
    game.elements.eventDescription.textContent = activeEvent.description;
    game.elements.eventEffect.textContent = SF.events.getEventEffectText(game, activeEvent);
    renderEventTags(game, activeEvent);
    game.elements.eventTimer.textContent = `${SF.utils.formatSeconds(remainingMs)}`;
    game.elements.eventProgressBar.style.width = `${Math.max(0, Math.min(100, progressPercent))}%`;
  }

  function renderMarketBanner(game, now = getRenderNow(game)) {
    const market = game.state.systems.market;
    const marketBasePrice = SF.market.getMarketBasePrice(game);
    const finalSellPrice = SF.market.getSellPrice(game);
    const remainingMs = Math.max(0, market.nextUpdateAt - now);
    const activeEvent = SF.events.getActiveEventDefinition(game);

    game.elements.marketBanner.className = `market-banner market-banner--${market.direction}`;
    game.elements.marketHeadline.textContent = SF.market.getMarketHeadline(game);
    game.elements.marketSummary.textContent = SF.market.getMarketDescription(game);
    game.elements.marketEffect.textContent = activeEvent?.sellPriceBonus
      ? `Base ${marketBasePrice}. Venda ${finalSellPrice}${game.state.prestige.level > 0 ? ` +${SF.prestige.getPrestigeBonusPercent(game)}%.` : "."}`
      : activeEvent?.sellPricePenalty
        ? `Base ${marketBasePrice}. Venda ${finalSellPrice}${game.state.prestige.level > 0 ? ` +${SF.prestige.getPrestigeBonusPercent(game)}%.` : ". Praga ativa."}`
        : game.state.prestige.level > 0
          ? `Base ${marketBasePrice}. Prestígio +${SF.prestige.getPrestigeBonusPercent(game)}%.`
          : `Base ${marketBasePrice}.`;
    game.elements.marketPriceValue.textContent = `${marketBasePrice} moedas`;
    game.elements.marketChangeIndicator.textContent = SF.market.getMarketChangeText(game);
    game.elements.marketTimer.textContent = `${SF.utils.formatSeconds(remainingMs)}`;
  }

  function renderComboStrip(game, now = getRenderNow(game)) {
    const combo = game.state.systems.combo;
    const isActive = combo.count >= 2 && Number.isFinite(combo.expiresAt) && now < combo.expiresAt;

    game.elements.comboStrip.hidden = !isActive;
    if (!isActive) {
      return;
    }

    const remainingMs = Math.max(0, combo.expiresAt - now);
    const progressPercent = (remainingMs / SF.config.combo.windowMs) * 100;
    const nextThreshold = SF.combo.getNextComboThreshold(combo.count);
    const rewardText = combo.rewardMoney > 0 ? ` +${combo.rewardMoney} moeda bônus` : "";

    game.elements.comboTitle.textContent = `Combo x${combo.count}${rewardText}`;
    game.elements.comboText.textContent = nextThreshold
      ? `Mais 1 para x${nextThreshold.count}.`
      : "Combo no máximo.";
    game.elements.comboTimer.textContent = `${SF.utils.formatSeconds(remainingMs)}`;
    game.elements.comboProgressBar.style.width = `${Math.max(0, Math.min(100, progressPercent))}%`;
  }

  function renderHelperCard(game, now = getRenderNow(game)) {
    const isActive = game.state.upgrades.helper;
    const nextHarvestAt = game.state.systems.helper.nextHarvestAt;

    game.elements.helperStatusValue.textContent = isActive ? "On" : "Off";
    const cycleExtras = [
      game.state.upgrades.helperGloves ? "limpeza" : "",
      game.state.upgrades.helperPlanting ? "plantio" : "",
    ].filter(Boolean).join(" + ");
    game.elements.helperStatusHint.textContent =
      isActive && Number.isFinite(nextHarvestAt)
        ? cycleExtras
          ? `Ciclo ${SF.utils.formatSeconds(Math.max(0, nextHarvestAt - now))} + ${cycleExtras}`
          : `Ciclo ${SF.utils.formatSeconds(Math.max(0, nextHarvestAt - now))}`
        : "Inativo";
    game.elements.helperCard.classList.toggle("stat--highlight", isActive);
  }

  function renderPrestigeCard(game) {
    game.elements.prestigeLevelValue.textContent = `Nível ${game.state.prestige.level}`;
    game.elements.prestigeBonusHint.textContent = `+${SF.prestige.getPrestigeBonusPercent(game)}% venda`;
    game.elements.prestigeCard.classList.toggle("stat--highlight", SF.prestige.isPrestigeAvailable(game));
  }

  function renderPrestigePanel(game) {
    const currentThreshold = SF.prestige.getPrestigeThreshold(game);
    const isAvailable = SF.prestige.isPrestigeAvailable(game);
    const nextBonusPercent = SF.prestige.getPrestigeBonusPercent(game, game.state.prestige.level + 1);

    game.elements.prestigePanel.classList.toggle("prestige-panel--available", isAvailable);
    game.elements.prestigePanelTitle.textContent = "Conhecimento do Morango";
    game.elements.prestigePanelDescription.textContent = isAvailable
      ? `Disponível: nível ${game.state.prestige.level + 1} com +${nextBonusPercent}% venda.`
      : SF.config.prestige.description;
    game.elements.prestigeThresholdText.textContent = isAvailable
      ? `Disponível com ${game.state.money} moedas.`
      : `Próximo em ${currentThreshold} moedas.`;
    game.elements.prestigeButton.disabled = !isAvailable;
    game.elements.prestigeButton.textContent = isAvailable
      ? `Prestigiar (+${nextBonusPercent}%)`
      : `Bloqueado · ${currentThreshold}`;
  }

  function renderHelperStrip(game, now = getRenderNow(game)) {
    const isActive = game.state.upgrades.helper;
    game.elements.helperStrip.hidden = !isActive;

    if (!isActive) {
      return;
    }

    const helper = game.state.systems.helper;
    const nextHarvestAt = Number.isFinite(helper.nextHarvestAt)
      ? Math.max(0, helper.nextHarvestAt - now)
      : SF.config.upgrades.helper.harvestIntervalMs;
    const recentAction = Number.isFinite(helper.lastActionAt) && now - helper.lastActionAt < 2800;
    game.elements.helperStripTitle.textContent = game.state.upgrades.helperGloves
      ? game.state.upgrades.helperPlanting
        ? "Auto-colheita + limpeza + plantio"
        : "Auto-colheita + limpeza"
      : game.state.upgrades.helperPlanting
        ? "Auto-colheita + plantio"
        : "Auto-colheita";

    game.elements.helperStripText.textContent =
      recentAction && helper.lastActionText
        ? helper.lastActionText
        : game.state.upgrades.helperPlanting
          ? "Colhe 1 pronto. Sem colheita, planta 1 vazio."
          : "Colhe 1 pronto por ciclo.";
    game.elements.helperStripTimer.textContent = `${SF.utils.formatSeconds(nextHarvestAt)}`;
  }

  function renderEventTags(game, activeEvent) {
    const tags = SF.events.getEventTags(game, activeEvent);
    game.elements.eventTags.hidden = tags.length === 0;
    game.elements.eventTags.innerHTML = "";

    tags.forEach((tag) => {
      const tagElement = document.createElement("span");
      tagElement.className = "event-banner__tag";
      tagElement.textContent = tag;
      game.elements.eventTags.append(tagElement);
    });
  }

  function renderProgression(game) {
    const completedCount = game.state.progression.completedGoalIds.length;
    game.elements.progressSummary.textContent = `${completedCount}/${SF.config.progressionGoals.length} metas`;
    game.elements.goalList.innerHTML = "";

    SF.config.progressionGoals.forEach((goal) => {
      const item = document.createElement("li");
      const isDone = game.state.progression.completedGoalIds.includes(goal.id);
      item.className = `goal-item${isDone ? " goal-item--done" : ""}`;

      const title = document.createElement("div");
      title.className = "goal-item__title";
      title.textContent = goal.title;

      const description = document.createElement("div");
      description.className = "goal-item__description";
      description.textContent = goal.description;

      const meta = document.createElement("div");
      meta.className = "goal-item__meta";
      meta.textContent = isDone ? "Concluída" : getGoalProgressText(game, goal);

      const progressBar = document.createElement("div");
      progressBar.className = "goal-item__bar";

      const progressFill = document.createElement("div");
      progressFill.className = "goal-item__fill";
      progressFill.style.width = `${getGoalPercent(game, goal)}%`;
      progressBar.append(progressFill);

      item.append(title, description, meta, progressBar);
      game.elements.goalList.append(item);
    });
  }

  function renderHelpPanel(game) {
    const isGuideTabActive = game.state.ui.activeSidebarTab === "guide";
    game.state.ui.helpOpen = isGuideTabActive;
    game.elements.helpPanel.hidden = !isGuideTabActive;
    game.elements.helpToggleButton.textContent = isGuideTabActive ? "Fechar guia" : "Guia";
    game.elements.helpToggleButton.setAttribute("aria-expanded", String(isGuideTabActive));
  }

  function renderSidebarTabs(game) {
    const activeTab = ["goals", "upgrades", "guide"].includes(game.state.ui.activeSidebarTab)
      ? game.state.ui.activeSidebarTab
      : "goals";
    const tabs = [
      { button: game.elements.sidebarGoalsTab, panel: game.elements.progressionPanel, id: "goals" },
      { button: game.elements.sidebarUpgradesTab, panel: game.elements.upgradesPanel, id: "upgrades" },
      { button: game.elements.sidebarGuideTab, panel: game.elements.helpPanel, id: "guide" },
    ];

    tabs.forEach(({ button, panel, id }) => {
      const isActive = activeTab === id;
      button.classList.toggle("management-tab--active", isActive);
      button.setAttribute("aria-selected", String(isActive));
      button.setAttribute("tabindex", isActive ? "0" : "-1");
      panel.hidden = !isActive;
    });
  }

  function renderProgressIndicators(game, farmMetrics) {
    const moneyProgressPercent = (Math.min(game.state.money, SF.config.winMoney) / SF.config.winMoney) * 100;
    const readyProgressPercent =
      farmMetrics.unlockedPlots > 0 ? (farmMetrics.readyPlots / farmMetrics.unlockedPlots) * 100 : 0;

    game.elements.moneyGoalProgressLabel.textContent = `${game.state.money} / ${SF.config.winMoney}`;
    game.elements.moneyGoalProgressBar.style.width = `${Math.max(0, Math.min(100, moneyProgressPercent))}%`;
    game.elements.readyPlotProgressLabel.textContent = `${farmMetrics.readyPlots} / ${farmMetrics.unlockedPlots}`;
    game.elements.readyPlotProgressBar.style.width = `${Math.max(0, Math.min(100, readyProgressPercent))}%`;
  }

  function renderMilestoneToast(game, now = getRenderNow(game)) {
    const toast = game.uiState.milestoneToast;
    const isVisible = Boolean(toast && toast.visibleUntil > now);

    game.elements.milestoneToast.hidden = !isVisible;
    if (!isVisible) {
      return;
    }

    game.elements.milestoneToastText.textContent = toast.message;
  }

  function getGoalProgressText(game, goal) {
    const currentValue = getGoalCurrentValue(game, goal);

    if (goal.targetType === "money") {
      return `${currentValue}/${goal.targetValue} moedas`;
    }
    if (goal.targetType === "harvestedTotal") {
      return `${currentValue}/${goal.targetValue} colhidos`;
    }
    if (goal.targetType === "upgradesPurchased") {
      return `${currentValue}/${goal.targetValue} melhorias`;
    }
    if (goal.targetType === "expandedFarm") {
      return game.state.farmLevel > 0 ? "Expansão liberada" : "Expansão pendente";
    }
    if (goal.targetType === "soldTotal") {
      return `${currentValue}/${goal.targetValue} vendidos`;
    }
    if (goal.targetType === "prestigeLevel") {
      return currentValue >= goal.targetValue ? "Prestígio feito" : "Prestígio pendente";
    }

    return `${currentValue}/${goal.targetValue}`;
  }

  function getGoalCurrentValue(game, goal) {
    if (goal.targetType === "harvestedTotal") {
      return game.state.stats.harvestedTotal;
    }
    if (goal.targetType === "upgradesPurchased") {
      return game.state.stats.upgradesPurchased;
    }
    if (goal.targetType === "money") {
      return game.state.money;
    }
    if (goal.targetType === "expandedFarm") {
      return game.state.farmLevel > 0 ? 1 : 0;
    }
    if (goal.targetType === "soldTotal") {
      return game.state.stats.soldTotal;
    }
    if (goal.targetType === "prestigeLevel") {
      return game.state.prestige.level;
    }
    return 0;
  }

  function getGoalPercent(game, goal) {
    if (goal.targetType === "expandedFarm") {
      return game.state.farmLevel > 0 ? 100 : 0;
    }
    if (goal.targetType === "prestigeLevel") {
      return game.state.prestige.level >= goal.targetValue ? 100 : 0;
    }

    const current = getGoalCurrentValue(game, goal);
    return Math.max(0, Math.min(100, (current / goal.targetValue) * 100));
  }

  function getSaveStatusText(game) {
    if (!game.storage.isPersistent) {
      return "Save indisponível";
    }
    if (game.dirty) {
      return "Salvando";
    }
    if (Number.isFinite(game.state.systems.lastSavedAt)) {
      return `Salvo ${SF.utils.formatClock(game.state.systems.lastSavedAt)}`;
    }
    return "Auto-save ativo";
  }

  function renderStatHighlights(game) {
    clearStatHighlights(game);

    const activeEvent = SF.events.getActiveEventDefinition(game);

    if (SF.prestige.isPrestigeAvailable(game)) {
      game.elements.prestigeCard.classList.add("stat--highlight");
      game.elements.moneyCard.classList.add("stat--highlight");
    }

    if (!activeEvent) {
      return;
    }

    if (activeEvent.sellPriceBonus) {
      game.elements.sellPriceCard.classList.add("stat--highlight");
      game.elements.moneyCard.classList.add("stat--highlight");
    }

    if (activeEvent.seedPriceDiscount) {
      game.elements.seedCard.classList.add("stat--highlight");
    }

    if (activeEvent.growthMultiplier) {
      game.elements.growthTimeCard.classList.add("stat--highlight");
      game.elements.plotCountCard.classList.add("stat--highlight");
    }
  }

  function clearStatHighlights(game) {
    [
      game.elements.moneyCard,
      game.elements.seedCard,
      game.elements.berryCard,
      game.elements.sellPriceCard,
      game.elements.growthTimeCard,
      game.elements.plotCountCard,
      game.elements.helperCard,
      game.elements.prestigeCard,
    ].forEach((element) => element.classList.remove("stat--highlight"));
  }

  SF.render.render = render;
  SF.render.renderStaticState = renderStaticState;
  SF.render.renderLiveState = renderLiveState;
  SF.render.renderSaveStatus = renderSaveStatus;
})(window.StrawberryFarm = window.StrawberryFarm || {});
