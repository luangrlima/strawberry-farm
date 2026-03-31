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
    elements.growthTimeValue.textContent = SF.utils.formatSeconds(SF.plots.getGrowthTimeMs(game));
    elements.plotCountValue.textContent = `${state.unlockedPlotCount}/${SF.config.maxPlotCount}`;
    elements.statusMessage.textContent = state.message;
    renderSaveStatus(game);
    renderStatHighlights(game);
    renderPrimaryActions(game);
    renderHelperCard(game, now);
    renderPrestigePanel(game);
    renderPriorityGoal(game);
    renderHelpPanel(game);
    renderSidebarTabs(game);
    renderUpgradeCards(game);
    renderProgression(game);
  }

  function renderLiveState(game, farmMetrics = SF.plots.getFarmMetrics(game), now = getRenderNow(game)) {
    renderHelperCard(game, now);
    renderFocusStrip(game, now);
    renderMilestoneToast(game, now);
    renderEventBanner(game, now);
    renderMarketBanner(game, now);
    SF.ui.renderFarmGrid(game, farmMetrics, now);
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
    const helperLevel = SF.upgrades.getUpgradeLevel(game, "helper");
    const currentFarmLevel = SF.plots.getFarmLevelConfig(game);
    const nextFarmLevel = SF.plots.getFarmLevelConfigByLevel(currentFarmLevel.level + 1);
    const farmAtMaxLevel = currentFarmLevel.level >= SF.config.farmLevels.length - 1;
    const nextFertilizerCost = SF.upgrades.getUpgradeCost("fertilizer", fertilizerLevel);
    const nextMarketCost = SF.upgrades.getUpgradeCost("market", marketLevel);
    const nextHelperCost = SF.upgrades.getUpgradeCost("helper", helperLevel);

    elements.buySeedButton.disabled = state.money < seedPrice;
    elements.buySeedButton.textContent = `Semente (${seedPrice})`;
    elements.sellButton.disabled = state.strawberries <= 0;
    elements.sellButton.textContent = "Vender lote";
    elements.fertilizerButton.disabled =
      SF.upgrades.isMaxLevel(game, "fertilizer") || state.money < nextFertilizerCost;
    elements.marketButton.disabled = SF.upgrades.isMaxLevel(game, "market") || state.money < nextMarketCost;
    elements.expandFarmButton.disabled = farmAtMaxLevel || state.money < nextFarmLevel.expansionCost;
    elements.helperButton.disabled = SF.upgrades.isMaxLevel(game, "helper") || state.money < nextHelperCost;

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
    elements.helperButton.textContent = SF.upgrades.isMaxLevel(game, "helper")
      ? "Nível máximo"
      : helperLevel > 0
        ? `Nível ${helperLevel + 1} · ${nextHelperCost}`
        : `Comprar · ${nextHelperCost}`;

    elements.buySeedButton.classList.toggle("action-btn--highlight", Boolean(activeEvent?.seedPriceDiscount));
    elements.sellButton.classList.toggle(
      "action-btn--highlight",
      Boolean(activeEvent?.sellPriceBonus) || marketBasePrice >= SF.config.market.maxPrice,
    );
    elements.fertilizerButton.classList.toggle("action-btn--highlight", Boolean(activeEvent?.growthMultiplier));
    elements.helperButton.classList.toggle("action-btn--highlight", helperLevel > 0);
  }

  function renderUpgradeCards(game) {
    const activeEvent = SF.events.getActiveEventDefinition(game);
    const fertilizerLevel = SF.upgrades.getUpgradeLevel(game, "fertilizer");
    const marketLevel = SF.upgrades.getUpgradeLevel(game, "market");
    const currentFarmLevel = SF.plots.getFarmLevelConfig(game);
    const nextFarmLevel = SF.plots.getFarmLevelConfigByLevel(currentFarmLevel.level + 1);
    const farmAtMaxLevel = currentFarmLevel.level >= SF.config.farmLevels.length - 1;
    const helperLevel = SF.upgrades.getUpgradeLevel(game, "helper");
    const maxFertilizerLevel = SF.config.upgrades.fertilizer.maxLevel;
    const maxMarketLevel = SF.config.upgrades.market.maxLevel;
    const maxHelperLevel = SF.config.upgrades.helper.maxLevel;
    const currentGrowthTime = SF.utils.formatSeconds(SF.plots.getGrowthTimeMs(game));
    const currentHelperTime = helperLevel > 0
      ? SF.utils.formatSeconds(SF.upgrades.getHelperHarvestInterval(helperLevel))
      : SF.utils.formatSeconds(SF.upgrades.getHelperHarvestInterval(1));
    const nextFertilizerLevel = Math.min(maxFertilizerLevel, fertilizerLevel + 1);
    const nextFertilizerReduction = SF.upgrades.getFertilizerReductionPercent(nextFertilizerLevel);
    const currentMarketBonus = SF.upgrades.getMarketSellBonus(marketLevel);
    const nextMarketLevel = Math.min(maxMarketLevel, marketLevel + 1);
    const nextMarketBonus = SF.upgrades.getMarketSellBonus(nextMarketLevel);
    const nextHelperLevel = Math.min(maxHelperLevel, helperLevel + 1);
    const nextHelperTime = SF.utils.formatSeconds(SF.upgrades.getHelperHarvestInterval(nextHelperLevel));

    game.elements.fertilizerLevelMeta.textContent = `Nível ${fertilizerLevel}/${maxFertilizerLevel}`;
    game.elements.marketLevelMeta.textContent = `Nível ${marketLevel}/${maxMarketLevel}`;
    game.elements.helperLevelMeta.textContent = `Nível ${helperLevel}/${maxHelperLevel}`;
    game.elements.fertilizerDescription.textContent =
      fertilizerLevel > 0
        ? SF.upgrades.isMaxLevel(game, "fertilizer")
          ? `Atual ${currentGrowthTime}. Redução total ${SF.upgrades.getFertilizerReductionPercent(fertilizerLevel)}%.`
          : `Atual ${currentGrowthTime}. Próx. -${nextFertilizerReduction}% do tempo base.`
        : SF.config.upgrades.fertilizer.description;
    game.elements.marketDescription.textContent =
      marketLevel > 0
        ? SF.upgrades.isMaxLevel(game, "market")
          ? `Atual ${SF.market.getSellPrice(game)} moedas. Bônus +${currentMarketBonus}${game.state.prestige.level > 0 ? `, prestígio +${SF.prestige.getPrestigeBonusPercent(game)}%.` : activeEvent?.sellPriceBonus ? ", evento somado." : "."}`
          : `Atual +${currentMarketBonus}. Próx. +${nextMarketBonus}.`
        : SF.config.upgrades.market.description;
    game.elements.expansionDescription.textContent = farmAtMaxLevel
      ? "Atual 4x4. Todos os 16 lotes liberados."
      : `Atual ${currentFarmLevel.label} (${currentFarmLevel.unlockedPlotCount}/16). Próx. ${nextFarmLevel.label} por ${nextFarmLevel.expansionCost}.`;
    game.elements.helperDescription.textContent =
      helperLevel <= 0
        ? SF.config.upgrades.helper.description
        : helperLevel >= maxHelperLevel
          ? `Atual ${currentHelperTime}. Colhe, planta e limpa no máximo.`
          : `Atual ${currentHelperTime}. Próx. ${nextHelperTime}${nextHelperLevel >= 2 ? " + plantio" : ""}${nextHelperLevel >= 3 ? " + limpeza" : ""}.`;
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
    game.elements.marketPriceValue.textContent = `${finalSellPrice} moedas`;
    game.elements.marketChangeIndicator.textContent = SF.market.getMarketChangeText(game);
    game.elements.marketTimer.textContent = `${SF.utils.formatSeconds(remainingMs)}`;
  }

  function renderFocusStrip(game, now = getRenderNow(game)) {
    const combo = game.state.systems.combo;
    const helperLevel = SF.upgrades.getUpgradeLevel(game, "helper");
    const helperActive = helperLevel > 0;
    const helper = game.state.systems.helper;
    const comboActive = combo.count >= 2 && Number.isFinite(combo.expiresAt) && now < combo.expiresAt;

    game.elements.focusStrip.hidden = !comboActive && !helperActive;

    if (comboActive) {
      const remainingMs = Math.max(0, combo.expiresAt - now);
      const progressPercent = (remainingMs / SF.config.combo.windowMs) * 100;
      const nextThreshold = SF.combo.getNextComboThreshold(combo.count);
      const rewardText = combo.rewardMoney > 0 ? ` +${combo.rewardMoney} moeda bônus` : "";

      game.elements.focusStrip.className = "focus-strip status-module focus-strip--combo";
      game.elements.focusStripEyebrow.textContent = "Combo";
      game.elements.focusStripTitle.textContent = `Combo x${combo.count}${rewardText}`;
      game.elements.focusStripText.textContent = nextThreshold
        ? `Mais 1 colheita para x${nextThreshold.count}.`
        : "Combo no máximo.";
      game.elements.focusStripTimer.textContent = `${SF.utils.formatSeconds(remainingMs)}`;
      game.elements.focusStripProgress.hidden = false;
      game.elements.focusStripProgressBar.style.width = `${Math.max(0, Math.min(100, progressPercent))}%`;
      return;
    }

    if (!helperActive) {
      return;
    }

    const nextHarvestAt = Number.isFinite(helper.nextHarvestAt)
      ? Math.max(0, helper.nextHarvestAt - now)
      : SF.upgrades.getHelperHarvestInterval(Math.max(1, helperLevel));
    const helperInterval = SF.upgrades.getHelperHarvestInterval(Math.max(1, helperLevel));
    const progressPercent = helperInterval > 0 ? 100 - (nextHarvestAt / helperInterval) * 100 : 0;
    const recentAction = Number.isFinite(helper.lastActionAt) && now - helper.lastActionAt < 2800;

    game.elements.focusStrip.className = "focus-strip status-module focus-strip--helper";
    game.elements.focusStripEyebrow.textContent = "Ajudante";
    game.elements.focusStripTitle.textContent = SF.upgrades.hasHelperGloves(game)
      ? SF.upgrades.hasHelperPlanting(game)
        ? "Colhe, planta e limpa"
        : "Colhe e limpa"
      : SF.upgrades.hasHelperPlanting(game)
        ? "Colhe e planta"
        : "Auto-colheita";
    game.elements.focusStripText.textContent =
      recentAction && helper.lastActionText
        ? helper.lastActionText
        : SF.upgrades.hasHelperPlanting(game)
          ? "Age sozinho no próximo ciclo."
          : "Colhe 1 pronto por ciclo.";
    game.elements.focusStripTimer.textContent = `${SF.utils.formatSeconds(nextHarvestAt)}`;
    game.elements.focusStripProgress.hidden = false;
    game.elements.focusStripProgressBar.style.width = `${Math.max(0, Math.min(100, progressPercent))}%`;
  }

  function renderHelperCard(game, now = getRenderNow(game)) {
    const helperLevel = SF.upgrades.getUpgradeLevel(game, "helper");
    const isActive = helperLevel > 0;
    const nextHarvestAt = game.state.systems.helper.nextHarvestAt;

    game.elements.helperStatusValue.textContent = isActive ? "On" : "Off";
    const cycleExtras = [
      SF.upgrades.hasHelperGloves(game) ? "limpeza" : "",
      SF.upgrades.hasHelperPlanting(game) ? "plantio" : "",
    ].filter(Boolean).join(" + ");
    game.elements.helperStatusHint.textContent =
      isActive && Number.isFinite(nextHarvestAt)
        ? cycleExtras
          ? `Nv.${helperLevel} · ${SF.utils.formatSeconds(Math.max(0, nextHarvestAt - now))} + ${cycleExtras}`
          : `Nv.${helperLevel} · ${SF.utils.formatSeconds(Math.max(0, nextHarvestAt - now))}`
        : "Inativo";
  }

  function renderPrestigePanel(game) {
    const currentThreshold = SF.prestige.getPrestigeThreshold(game);
    const isAvailable = SF.prestige.isPrestigeAvailable(game);
    const nextBonusPercent = SF.prestige.getPrestigeBonusPercent(game, game.state.prestige.level + 1);

    game.elements.prestigePanel.classList.toggle("prestige-panel--available", isAvailable);
    game.elements.prestigeLevelValue.textContent = `Nível ${game.state.prestige.level}`;
    game.elements.prestigeBonusHint.textContent = `+${SF.prestige.getPrestigeBonusPercent(game)}% venda`;
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
    const priorityGoal = SF.progression.getPriorityGoal(game);
    game.elements.progressSummary.textContent = `${completedCount}/${SF.config.progressionGoals.length} metas`;
    game.elements.goalList.innerHTML = "";

    renderFeaturedGoal(game, priorityGoal);

    SF.config.progressionGoals.forEach((goal) => {
      if (priorityGoal && goal.id === priorityGoal.id) {
        return;
      }

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
    game.elements.helpPanel.hidden = !game.state.ui.helpOpen;
    game.elements.helpToggleButton.textContent = game.state.ui.helpOpen ? "Fechar guia" : "Guia";
    game.elements.helpToggleButton.setAttribute("aria-expanded", String(game.state.ui.helpOpen));
  }

  function renderSidebarTabs(game) {
    const activeTab = ["goals", "upgrades"].includes(game.state.ui.activeSidebarTab)
      ? game.state.ui.activeSidebarTab
      : "goals";
    const tabs = [
      { button: game.elements.sidebarGoalsTab, panel: game.elements.progressionPanel, id: "goals" },
      { button: game.elements.sidebarUpgradesTab, panel: game.elements.upgradesPanel, id: "upgrades" },
    ];

    tabs.forEach(({ button, panel, id }) => {
      const isActive = activeTab === id;
      button.classList.toggle("management-tab--active", isActive);
      button.setAttribute("aria-selected", String(isActive));
      button.setAttribute("tabindex", isActive ? "0" : "-1");
      panel.hidden = !isActive;
    });
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

  function renderPriorityGoal(game) {
    const priorityGoal = SF.progression.getPriorityGoal(game);
    const completedCount = game.state.progression.completedGoalIds.length;

    if (!priorityGoal) {
      game.elements.priorityGoalCard.classList.add("priority-goal-card--done");
      game.elements.priorityGoalTitle.textContent = "Todas as metas concluídas";
      game.elements.priorityGoalProgressText.textContent = "Fazenda pronta para prestigiar ou otimizar.";
      game.elements.priorityGoalProgressBar.style.width = "100%";
      game.elements.priorityGoalRewardText.textContent = `${completedCount}/${SF.config.progressionGoals.length} metas concluídas`;
      return;
    }

    game.elements.priorityGoalCard.classList.remove("priority-goal-card--done");
    game.elements.priorityGoalTitle.textContent = priorityGoal.title;
    game.elements.priorityGoalProgressText.textContent = getGoalProgressText(game, priorityGoal);
    game.elements.priorityGoalProgressBar.style.width = `${getGoalPercent(game, priorityGoal)}%`;
    game.elements.priorityGoalRewardText.textContent = getGoalRewardText(priorityGoal);
  }

  function renderFeaturedGoal(game, priorityGoal) {
    if (!priorityGoal) {
      game.elements.featuredGoalCard.hidden = true;
      return;
    }

    game.elements.featuredGoalCard.hidden = false;
    game.elements.featuredGoalTitle.textContent = priorityGoal.title;
    game.elements.featuredGoalProgressText.textContent = getGoalProgressText(game, priorityGoal);
    game.elements.featuredGoalProgressBar.style.width = `${getGoalPercent(game, priorityGoal)}%`;
    game.elements.featuredGoalRewardText.textContent = getGoalRewardText(priorityGoal);
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

  function getGoalRewardText(goal) {
    if (!goal.reward) {
      return "Sem recompensa extra";
    }

    if (Number.isFinite(goal.reward.money) && goal.reward.money > 0) {
      return `Recompensa: +${goal.reward.money} moedas`;
    }

    if (Number.isFinite(goal.reward.seeds) && goal.reward.seeds > 0) {
      return `Recompensa: +${goal.reward.seeds} sementes`;
    }

    return "Sem recompensa extra";
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
      game.elements.prestigePanel.classList.add("prestige-panel--available");
      game.elements.moneyCard.classList.add("stat--highlight");
    }

    if (!activeEvent) {
      return;
    }

    if (activeEvent.sellPriceBonus) {
      game.elements.marketBanner.classList.add("market-banner--highlight");
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
      game.elements.growthTimeCard,
      game.elements.plotCountCard,
    ].forEach((element) => element.classList.remove("stat--highlight"));

    game.elements.prestigePanel.classList.remove("prestige-panel--available");
    game.elements.marketBanner.classList.remove("market-banner--highlight");
  }

  SF.render.render = render;
  SF.render.renderStaticState = renderStaticState;
  SF.render.renderLiveState = renderLiveState;
  SF.render.renderSaveStatus = renderSaveStatus;
})(window.StrawberryFarm = window.StrawberryFarm || {});
