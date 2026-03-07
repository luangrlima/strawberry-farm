const config = window.STRAWBERRY_CONFIG;

const elements = {
  moneyCount: document.querySelector("#moneyCount"),
  seedCount: document.querySelector("#seedCount"),
  berryCount: document.querySelector("#berryCount"),
  sellPriceValue: document.querySelector("#sellPriceValue"),
  growthTimeValue: document.querySelector("#growthTimeValue"),
  plotCountValue: document.querySelector("#plotCountValue"),
  goalStatus: document.querySelector("#goalStatus"),
  statusMessage: document.querySelector("#statusMessage"),
  saveStatus: document.querySelector("#saveStatus"),
  eventBanner: document.querySelector("#eventBanner"),
  eventTitle: document.querySelector("#eventTitle"),
  eventDescription: document.querySelector("#eventDescription"),
  eventTimer: document.querySelector("#eventTimer"),
  progressSummary: document.querySelector("#progressSummary"),
  goalList: document.querySelector("#goalList"),
  farmGrid: document.querySelector("#farmGrid"),
  buySeedButton: document.querySelector("#buySeedButton"),
  sellButton: document.querySelector("#sellButton"),
  resetButton: document.querySelector("#resetButton"),
  fertilizerButton: document.querySelector("#fertilizerButton"),
  marketButton: document.querySelector("#marketButton"),
  expandFarmButton: document.querySelector("#expandFarmButton"),
  fertilizerDescription: document.querySelector("#fertilizerDescription"),
  marketDescription: document.querySelector("#marketDescription"),
  expansionDescription: document.querySelector("#expansionDescription"),
};

const storage = createStorageAdapter();
const plotElements = [];
const debugState = {
  randomEventsEnabled: true,
};
let state = loadState();
let autosaveIntervalId = null;
let dirty = false;

render();
startTicker();
startAutosave();
attachEvents();
attachDebugHelpers();

function attachEvents() {
  elements.buySeedButton.addEventListener("click", buySeed);
  elements.sellButton.addEventListener("click", sellStrawberries);
  elements.resetButton.addEventListener("click", resetGame);
  elements.fertilizerButton.addEventListener("click", buyFertilizerUpgrade);
  elements.marketButton.addEventListener("click", buyMarketUpgrade);
  elements.expandFarmButton.addEventListener("click", expandFarm);
  window.addEventListener("pagehide", flushAutosave);
  window.addEventListener("beforeunload", flushAutosave);
}

function attachDebugHelpers() {
  window.__strawberryFarmDebug = {
    forceEvent(eventId, durationMs = config.events.durationMs) {
      activateEvent(eventId, durationMs, true);
      dirty = true;
      saveState();
      render();
    },
    clearEvent() {
      clearActiveEvent();
      dirty = true;
      saveState();
      render();
    },
    getState() {
      return JSON.parse(JSON.stringify(state));
    },
    setRandomEventsEnabled(enabled) {
      debugState.randomEventsEnabled = Boolean(enabled);
    },
  };
}

function createInitialState() {
  return {
    money: config.startingState.money,
    seeds: config.startingState.seeds,
    strawberries: config.startingState.strawberries,
    unlockedPlotCount: config.initialPlotCount,
    hasExpandedFarm: false,
    activeEvent: null,
    upgrades: {
      fertilizer: false,
      market: false,
    },
    progression: {
      completedGoalIds: [],
    },
    stats: {
      harvestedTotal: 0,
      soldTotal: 0,
      upgradesPurchased: 0,
      eventsTriggered: 0,
    },
    lastSavedAt: null,
    message: "Plante seus primeiros morangos.",
    plots: Array.from({ length: config.maxPlotCount }, (_, index) => ({
      id: index,
      state: config.plotStates.empty,
      plantedAt: null,
      readyAt: null,
      growthDurationMs: null,
    })),
  };
}

function loadState() {
  const saved = storage.getItem(config.storageKey);

  if (!saved) {
    const initialState = createInitialState();

    if (!storage.isPersistent) {
      initialState.message =
        "Seu navegador bloqueou o salvamento local neste arquivo. O jogo funciona, mas sem salvar progresso.";
    }

    return initialState;
  }

  try {
    return hydrateState(JSON.parse(saved));
  } catch {
    return createInitialState();
  }
}

function hydrateState(savedState) {
  const nextState = createInitialState();

  nextState.money = Number.isFinite(savedState.money) ? savedState.money : nextState.money;
  nextState.seeds = Number.isFinite(savedState.seeds) ? savedState.seeds : nextState.seeds;
  nextState.strawberries = Number.isFinite(savedState.strawberries)
    ? savedState.strawberries
    : nextState.strawberries;
  nextState.message = typeof savedState.message === "string" ? savedState.message : nextState.message;
  nextState.lastSavedAt = Number.isFinite(savedState.lastSavedAt) ? savedState.lastSavedAt : null;
  nextState.unlockedPlotCount = Number.isFinite(savedState.unlockedPlotCount)
    ? Math.max(config.initialPlotCount, Math.min(config.maxPlotCount, savedState.unlockedPlotCount))
    : nextState.unlockedPlotCount;
  nextState.hasExpandedFarm = Boolean(savedState.hasExpandedFarm) || nextState.unlockedPlotCount === config.maxPlotCount;

  if (savedState.activeEvent && typeof savedState.activeEvent === "object") {
    const eventDefinition = getEventDefinition(savedState.activeEvent.id);

    if (eventDefinition && Number.isFinite(savedState.activeEvent.endsAt)) {
      nextState.activeEvent = {
        id: eventDefinition.id,
        endsAt: savedState.activeEvent.endsAt,
      };
    }
  }

  if (savedState.upgrades && typeof savedState.upgrades === "object") {
    nextState.upgrades.fertilizer = Boolean(savedState.upgrades.fertilizer);
    nextState.upgrades.market = Boolean(savedState.upgrades.market);
  }

  if (savedState.progression && Array.isArray(savedState.progression.completedGoalIds)) {
    nextState.progression.completedGoalIds = savedState.progression.completedGoalIds.filter((goalId) =>
      config.progressionGoals.some((goal) => goal.id === goalId),
    );
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

  updateActiveEvent(nextState);
  updatePlotsByTime(nextState);
  return nextState;
}

function saveState() {
  state.lastSavedAt = Date.now();
  storage.setItem(config.storageKey, JSON.stringify(state));
  dirty = false;
}

function createStorageAdapter() {
  try {
    const testKey = `${config.storageKey}-test`;
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

function getEventDefinition(eventId) {
  return config.events.definitions.find((event) => event.id === eventId) || null;
}

function getActiveEventDefinition(targetState = state) {
  if (!targetState.activeEvent) {
    return null;
  }

  return getEventDefinition(targetState.activeEvent.id);
}

function getSeedPrice() {
  const activeEvent = getActiveEventDefinition();
  const discount = activeEvent?.seedPriceDiscount || 0;
  return Math.max(1, config.crop.seedPrice - discount);
}

function getGrowthTimeMs() {
  let growthTime = config.crop.growthTimeMs;

  if (state.upgrades.fertilizer) {
    growthTime *= config.upgrades.fertilizer.growthMultiplier;
  }

  const activeEvent = getActiveEventDefinition();

  if (activeEvent?.growthMultiplier) {
    growthTime *= activeEvent.growthMultiplier;
  }

  return Math.max(3000, Math.floor(growthTime));
}

function getSellPrice() {
  let sellPrice = config.crop.sellPrice;

  if (state.upgrades.market) {
    sellPrice += config.upgrades.market.sellPriceBonus;
  }

  const activeEvent = getActiveEventDefinition();

  if (activeEvent?.sellPriceBonus) {
    sellPrice += activeEvent.sellPriceBonus;
  }

  return sellPrice;
}

function buySeed() {
  const seedPrice = getSeedPrice();

  if (state.money < seedPrice) {
    setMessage("Você não tem moedas suficientes para comprar uma semente.");
    render();
    return;
  }

  state.money -= seedPrice;
  state.seeds += 1;
  setMessage("Você comprou 1 semente.");
  commit();
}

function sellStrawberries() {
  if (state.strawberries <= 0) {
    setMessage("Você não tem morangos para vender.");
    render();
    return;
  }

  const sellPrice = getSellPrice();
  const quantity = state.strawberries;
  const earnedMoney = quantity * sellPrice;
  state.money += earnedMoney;
  state.strawberries = 0;
  state.stats.soldTotal += quantity;
  setMessage(`Você vendeu morangos por ${earnedMoney} moedas.`);
  maybeTriggerRandomEvent();
  commit();
}

function buyFertilizerUpgrade() {
  const upgrade = config.upgrades.fertilizer;

  if (state.upgrades.fertilizer) {
    setMessage("O adubo rápido já está ativo.");
    render();
    return;
  }

  if (state.money < upgrade.cost) {
    setMessage("Você ainda não tem moedas suficientes para comprar o adubo rápido.");
    render();
    return;
  }

  state.money -= upgrade.cost;
  state.upgrades.fertilizer = true;
  state.stats.upgradesPurchased += 1;
  setMessage("Adubo rápido comprado. Novos plantios crescem mais rápido.");
  commit();
}

function buyMarketUpgrade() {
  const upgrade = config.upgrades.market;

  if (state.upgrades.market) {
    setMessage("A caixa premium já está ativa.");
    render();
    return;
  }

  if (state.money < upgrade.cost) {
    setMessage("Você ainda não tem moedas suficientes para melhorar a venda.");
    render();
    return;
  }

  state.money -= upgrade.cost;
  state.upgrades.market = true;
  state.stats.upgradesPurchased += 1;
  setMessage("Caixa premium comprada. Cada morango vendido vale mais.");
  commit();
}

function expandFarm() {
  if (state.hasExpandedFarm) {
    setMessage("Sua fazenda já está no tamanho máximo desta versão.");
    render();
    return;
  }

  if (state.money < config.expansion.cost) {
    setMessage("Você ainda não tem moedas suficientes para expandir a fazenda.");
    render();
    return;
  }

  state.money -= config.expansion.cost;
  state.unlockedPlotCount = config.maxPlotCount;
  state.hasExpandedFarm = true;
  setMessage("Fazenda expandida. Agora você tem 16 canteiros.");
  commit();
}

function resetGame() {
  const shouldReset = window.confirm(
    "Reiniciar todo o progresso?\n\nIsso apaga moedas, sementes, upgrades, eventos, metas e plantações salvas.",
  );

  if (!shouldReset) {
    setMessage("O progresso foi mantido.");
    render();
    return;
  }

  state = createInitialState();
  saveState();
  render();
}

function handlePlotClick(plotIndex) {
  const plot = state.plots[plotIndex];

  if (!plot || plotIndex >= state.unlockedPlotCount) {
    return;
  }

  if (plot.state === config.plotStates.empty) {
    plantPlot(plot);
    return;
  }

  if (plot.state === config.plotStates.ready) {
    harvestPlot(plot);
    return;
  }

  setMessage("Esse morango ainda está crescendo.");
  render();
}

function plantPlot(plot) {
  if (state.seeds <= 0) {
    setMessage("Você precisa de sementes para plantar.");
    render();
    return;
  }

  const now = Date.now();
  const growthDurationMs = getGrowthTimeMs();
  plot.state = config.plotStates.growing;
  plot.plantedAt = now;
  plot.readyAt = now + growthDurationMs;
  plot.growthDurationMs = growthDurationMs;
  state.seeds -= 1;
  setMessage("Semente plantada. Volte em alguns segundos.");
  commit();
}

function harvestPlot(plot) {
  plot.state = config.plotStates.empty;
  plot.plantedAt = null;
  plot.readyAt = null;
  plot.growthDurationMs = null;
  state.strawberries += config.crop.harvestYield;
  state.stats.harvestedTotal += config.crop.harvestYield;
  setMessage("Você colheu 1 morango.");
  commit();
}

function maybeTriggerRandomEvent() {
  if (!debugState.randomEventsEnabled || state.activeEvent || Math.random() > config.events.triggerChanceOnSell) {
    return;
  }

  const randomIndex = Math.floor(Math.random() * config.events.definitions.length);
  const randomEvent = config.events.definitions[randomIndex];
  activateEvent(randomEvent.id, config.events.durationMs);
}

function activateEvent(eventId, durationMs, isForced = false) {
  const eventDefinition = getEventDefinition(eventId);

  if (!eventDefinition) {
    return;
  }

  state.activeEvent = {
    id: eventDefinition.id,
    endsAt: Date.now() + durationMs,
  };

  if (eventDefinition.activePlotRemainingMultiplier) {
    accelerateGrowingPlots(eventDefinition.activePlotRemainingMultiplier);
  }

  if (!isForced) {
    state.stats.eventsTriggered += 1;
    setMessage(`Evento ativo: ${eventDefinition.title}.`);
  }
}

function accelerateGrowingPlots(remainingMultiplier) {
  const now = Date.now();

  state.plots.slice(0, state.unlockedPlotCount).forEach((plot) => {
    if (plot.state !== config.plotStates.growing || !Number.isFinite(plot.readyAt)) {
      return;
    }

    const remaining = Math.max(0, plot.readyAt - now);
    plot.readyAt = now + Math.max(1000, Math.floor(remaining * remainingMultiplier));
  });
}

function clearActiveEvent() {
  state.activeEvent = null;
}

function updateActiveEvent(targetState = state) {
  if (!targetState.activeEvent) {
    return false;
  }

  if (Date.now() < targetState.activeEvent.endsAt) {
    return false;
  }

  targetState.activeEvent = null;
  return true;
}

function updatePlotsByTime(targetState = state) {
  const now = Date.now();
  let changed = false;

  targetState.plots.slice(0, targetState.unlockedPlotCount).forEach((plot) => {
    if (plot.state === config.plotStates.growing && Number.isFinite(plot.readyAt) && now >= plot.readyAt) {
      plot.state = config.plotStates.ready;
      plot.plantedAt = null;
      plot.readyAt = null;
      plot.growthDurationMs = null;
      changed = true;
    }
  });

  return changed;
}

function startTicker() {
  window.setInterval(() => {
    const eventEnded = updateActiveEvent();
    const plotsReady = updatePlotsByTime();

    if (eventEnded) {
      setMessage("O evento terminou.");
      dirty = true;
    } else if (plotsReady) {
      setMessage("Um morango está pronto para colher.");
      dirty = true;
    }

    render();
  }, 250);
}

function startAutosave() {
  autosaveIntervalId = window.setInterval(() => {
    if (!dirty) {
      return;
    }

    saveState();
    render();
  }, config.autosaveIntervalMs);
}

function flushAutosave() {
  if (!dirty) {
    return;
  }

  saveState();
}

function commit() {
  updateActiveEvent();
  updatePlotsByTime();
  const goalRewards = applyProgressionGoals();

  if (goalRewards.length > 0) {
    setMessage(goalRewards.join(" "));
  }

  dirty = true;
  saveState();
  render();
}

function applyProgressionGoals() {
  const unlockedMessages = [];

  config.progressionGoals.forEach((goal) => {
    if (state.progression.completedGoalIds.includes(goal.id)) {
      return;
    }

    if (!hasReachedGoal(goal)) {
      return;
    }

    state.progression.completedGoalIds.push(goal.id);
    const rewardMessage = grantGoalReward(goal.reward);
    unlockedMessages.push(
      rewardMessage
        ? `Meta concluída: ${goal.title}. ${rewardMessage}`
        : `Meta concluída: ${goal.title}.`,
    );
  });

  return unlockedMessages;
}

function hasReachedGoal(goal) {
  if (goal.targetType === "harvestedTotal") {
    return state.stats.harvestedTotal >= goal.targetValue;
  }

  if (goal.targetType === "upgradesPurchased") {
    return state.stats.upgradesPurchased >= goal.targetValue;
  }

  if (goal.targetType === "money") {
    return state.money >= goal.targetValue;
  }

  if (goal.targetType === "expandedFarm") {
    return state.hasExpandedFarm;
  }

  return false;
}

function grantGoalReward(reward) {
  if (!reward) {
    return "";
  }

  const rewardParts = [];

  if (Number.isFinite(reward.money) && reward.money > 0) {
    state.money += reward.money;
    rewardParts.push(`Recompensa: +${reward.money} moedas.`);
  }

  if (Number.isFinite(reward.seeds) && reward.seeds > 0) {
    state.seeds += reward.seeds;
    rewardParts.push(`Recompensa: +${reward.seeds} sementes.`);
  }

  return rewardParts.join(" ");
}

function setMessage(message) {
  state.message = message;
}

function render() {
  updateActiveEvent();
  updatePlotsByTime();

  document.title = config.title;
  elements.moneyCount.textContent = String(state.money);
  elements.seedCount.textContent = String(state.seeds);
  elements.berryCount.textContent = String(state.strawberries);
  elements.sellPriceValue.textContent = `${getSellPrice()} moedas`;
  elements.growthTimeValue.textContent = formatSeconds(getGrowthTimeMs());
  elements.plotCountValue.textContent = `${state.unlockedPlotCount}/${config.maxPlotCount}`;
  elements.statusMessage.textContent = state.message;
  elements.saveStatus.textContent = getSaveStatusText();

  const hasWon = state.progression.completedGoalIds.includes("reach-35");
  elements.goalStatus.textContent = hasWon
    ? "Você construiu uma pequena fazenda de morangos!"
    : `Meta: alcançar ${config.winMoney} moedas`;
  elements.goalStatus.classList.toggle("goal--won", hasWon);

  const seedPrice = getSeedPrice();
  elements.buySeedButton.disabled = state.money < seedPrice;
  elements.buySeedButton.textContent = `Comprar semente (${seedPrice})`;
  elements.sellButton.disabled = state.strawberries <= 0;
  elements.fertilizerButton.disabled =
    state.upgrades.fertilizer || state.money < config.upgrades.fertilizer.cost;
  elements.marketButton.disabled = state.upgrades.market || state.money < config.upgrades.market.cost;
  elements.expandFarmButton.disabled = state.hasExpandedFarm || state.money < config.expansion.cost;

  elements.fertilizerButton.textContent = state.upgrades.fertilizer
    ? "Adubo ativo"
    : `Comprar adubo (${config.upgrades.fertilizer.cost})`;
  elements.marketButton.textContent = state.upgrades.market
    ? "Venda melhorada"
    : `Melhorar venda (${config.upgrades.market.cost})`;
  elements.expandFarmButton.textContent = state.hasExpandedFarm
    ? "Fazenda expandida"
    : `Expandir fazenda (${config.expansion.cost})`;

  elements.fertilizerDescription.textContent = state.upgrades.fertilizer
    ? `Ativo: novos plantios levam ${formatSeconds(getGrowthTimeMs())}.`
    : config.upgrades.fertilizer.description;
  elements.marketDescription.textContent = state.upgrades.market
    ? `Ativo: cada morango vendido vale ${getSellPrice()} moedas${getActiveEventDefinition()?.sellPriceBonus ? " durante o evento." : "."}`
    : config.upgrades.market.description;
  elements.expansionDescription.textContent = state.hasExpandedFarm
    ? "Ativo: todos os 16 canteiros estão liberados."
    : config.expansion.description;

  renderEventBanner();
  renderFarmGrid();
  renderProgression();
}

function renderEventBanner() {
  const activeEvent = getActiveEventDefinition();

  if (!activeEvent || !state.activeEvent) {
    elements.eventBanner.className = "event-banner event-banner--idle";
    elements.eventTitle.textContent = "Nenhum evento ativo";
    elements.eventDescription.textContent =
      "Venda morangos para ter chance de ativar um evento curto.";
    elements.eventTimer.textContent = "Aguardando";
    return;
  }

  elements.eventBanner.className = `event-banner ${activeEvent.accentClass}`;
  elements.eventTitle.textContent = activeEvent.title;
  elements.eventDescription.textContent = activeEvent.description;
  elements.eventTimer.textContent = `Termina em ${formatSeconds(state.activeEvent.endsAt - Date.now())}`;
}

function renderFarmGrid() {
  if (plotElements.length !== state.unlockedPlotCount) {
    createFarmGrid();
  }

  elements.farmGrid.classList.toggle("farm-grid--expanded", state.hasExpandedFarm);

  state.plots.slice(0, state.unlockedPlotCount).forEach((plot, index) => {
    const plotElement = plotElements[index];

    if (!plotElement) {
      return;
    }

    const progress = getPlotProgress(plot);
    plotElement.button.className = `plot plot--${plot.state}`;
    plotElement.button.setAttribute("aria-label", getPlotLabel(plot, index));
    plotElement.emoji.textContent = getPlotEmoji(plot);
    plotElement.name.textContent = getPlotName(plot);
    plotElement.timer.textContent = getPlotTimerText(plot);
    plotElement.hint.textContent = getPlotHint(plot);
    plotElement.progressFill.style.width = `${progress}%`;
    plotElement.progressTrack.hidden = plot.state !== config.plotStates.growing;
  });
}

function createFarmGrid() {
  elements.farmGrid.innerHTML = "";
  plotElements.length = 0;

  state.plots.slice(0, state.unlockedPlotCount).forEach((_, index) => {
    const plotButton = document.createElement("button");
    plotButton.type = "button";
    plotButton.className = "plot";
    plotButton.addEventListener("click", () => handlePlotClick(index));

    const emoji = document.createElement("div");
    emoji.className = "plot__emoji";

    const name = document.createElement("div");
    name.className = "plot__name";

    const timer = document.createElement("div");
    timer.className = "plot__timer";

    const progressTrack = document.createElement("div");
    progressTrack.className = "plot__progress";

    const progressFill = document.createElement("div");
    progressFill.className = "plot__progress-fill";
    progressTrack.append(progressFill);

    const hint = document.createElement("div");
    hint.className = "plot__hint";

    plotButton.append(emoji, name, timer, progressTrack, hint);
    elements.farmGrid.append(plotButton);
    plotElements.push({
      button: plotButton,
      emoji,
      name,
      timer,
      progressTrack,
      progressFill,
      hint,
    });
  });
}

function renderProgression() {
  const completedCount = state.progression.completedGoalIds.length;
  elements.progressSummary.textContent = `${completedCount} de ${config.progressionGoals.length} metas concluídas`;
  elements.goalList.innerHTML = "";

  config.progressionGoals.forEach((goal) => {
    const item = document.createElement("li");
    const isDone = state.progression.completedGoalIds.includes(goal.id);
    item.className = `goal-item${isDone ? " goal-item--done" : ""}`;

    const title = document.createElement("div");
    title.className = "goal-item__title";
    title.textContent = goal.title;

    const description = document.createElement("div");
    description.className = "goal-item__description";
    description.textContent = goal.description;

    const meta = document.createElement("div");
    meta.className = "goal-item__meta";
    meta.textContent = isDone ? "Concluída" : getGoalProgressText(goal);

    item.append(title, description, meta);
    elements.goalList.append(item);
  });
}

function getGoalProgressText(goal) {
  const currentValue = getGoalCurrentValue(goal);

  if (goal.targetType === "money") {
    return `${currentValue}/${goal.targetValue} moedas`;
  }

  if (goal.targetType === "harvestedTotal") {
    return `${currentValue}/${goal.targetValue} morangos colhidos`;
  }

  if (goal.targetType === "upgradesPurchased") {
    return `${currentValue}/${goal.targetValue} melhorias`;
  }

  if (goal.targetType === "expandedFarm") {
    return state.hasExpandedFarm ? "4x4 liberado" : "Expansão pendente";
  }

  return `${currentValue}/${goal.targetValue}`;
}

function getGoalCurrentValue(goal) {
  if (goal.targetType === "harvestedTotal") {
    return state.stats.harvestedTotal;
  }

  if (goal.targetType === "upgradesPurchased") {
    return state.stats.upgradesPurchased;
  }

  if (goal.targetType === "money") {
    return state.money;
  }

  if (goal.targetType === "expandedFarm") {
    return state.hasExpandedFarm ? 1 : 0;
  }

  return 0;
}

function getPlotEmoji(plot) {
  if (plot.state === config.plotStates.growing) {
    return "🌱";
  }

  if (plot.state === config.plotStates.ready) {
    return "🍓";
  }

  return "🟫";
}

function getPlotName(plot) {
  if (plot.state === config.plotStates.growing) {
    return "Crescendo";
  }

  if (plot.state === config.plotStates.ready) {
    return "Pronto para colher";
  }

  return "Terreno vazio";
}

function getPlotTimerText(plot) {
  if (plot.state === config.plotStates.growing && Number.isFinite(plot.readyAt)) {
    const remainingMs = Math.max(0, plot.readyAt - Date.now());
    return `Faltam ${formatSeconds(remainingMs)}`;
  }

  if (plot.state === config.plotStates.ready) {
    return "Clique para colher";
  }

  return "Clique para plantar";
}

function getPlotHint(plot) {
  if (plot.state === config.plotStates.growing) {
    return `${Math.round(getPlotProgress(plot))}% concluído`;
  }

  if (plot.state === config.plotStates.ready) {
    return "Colheita disponível";
  }

  return "Aguardando semente";
}

function getPlotProgress(plot) {
  if (
    plot.state !== config.plotStates.growing ||
    !Number.isFinite(plot.readyAt) ||
    !Number.isFinite(plot.plantedAt)
  ) {
    return plot.state === config.plotStates.ready ? 100 : 0;
  }

  const duration = plot.growthDurationMs || config.crop.growthTimeMs;
  const elapsed = Date.now() - plot.plantedAt;
  return Math.max(0, Math.min(100, (elapsed / duration) * 100));
}

function formatSeconds(durationMs) {
  const seconds = Math.max(0, Math.ceil(durationMs / 1000));
  return `${seconds}s`;
}

function getPlotLabel(plot, index) {
  return `Canteiro ${index + 1}: ${getPlotName(plot)}. ${getPlotTimerText(plot)}. ${getPlotHint(plot)}`;
}

function getSaveStatusText() {
  if (!storage.isPersistent) {
    return "Salvamento local indisponível neste arquivo.";
  }

  if (dirty) {
    return "Salvando automaticamente...";
  }

  if (Number.isFinite(state.lastSavedAt)) {
    return `Salvo automaticamente às ${formatClock(state.lastSavedAt)}.`;
  }

  return "Salvamento automático ativo.";
}

function formatClock(timestamp) {
  return new Date(timestamp).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
