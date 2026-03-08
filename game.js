const config = window.STRAWBERRY_CONFIG;

const elements = {
  moneyCount: document.querySelector("#moneyCount"),
  seedCount: document.querySelector("#seedCount"),
  berryCount: document.querySelector("#berryCount"),
  moneyCard: document.querySelector("#moneyCard"),
  seedCard: document.querySelector("#seedCard"),
  berryCard: document.querySelector("#berryCard"),
  sellPriceValue: document.querySelector("#sellPriceValue"),
  sellPriceHint: document.querySelector("#sellPriceHint"),
  sellPriceCard: document.querySelector("#sellPriceCard"),
  growthTimeValue: document.querySelector("#growthTimeValue"),
  growthTimeCard: document.querySelector("#growthTimeCard"),
  plotCountValue: document.querySelector("#plotCountValue"),
  plotCountCard: document.querySelector("#plotCountCard"),
  helperCard: document.querySelector("#helperCard"),
  helperStatusValue: document.querySelector("#helperStatusValue"),
  helperStatusHint: document.querySelector("#helperStatusHint"),
  goalStatus: document.querySelector("#goalStatus"),
  helpPanel: document.querySelector("#helpPanel"),
  helpToggleButton: document.querySelector("#helpToggleButton"),
  helpDismissButton: document.querySelector("#helpDismissButton"),
  statusMessage: document.querySelector("#statusMessage"),
  comboStrip: document.querySelector("#comboStrip"),
  comboTitle: document.querySelector("#comboTitle"),
  comboText: document.querySelector("#comboText"),
  comboTimer: document.querySelector("#comboTimer"),
  comboProgressBar: document.querySelector("#comboProgressBar"),
  helperStrip: document.querySelector("#helperStrip"),
  helperStripText: document.querySelector("#helperStripText"),
  helperStripTimer: document.querySelector("#helperStripTimer"),
  milestoneToast: document.querySelector("#milestoneToast"),
  milestoneToastText: document.querySelector("#milestoneToastText"),
  saveStatus: document.querySelector("#saveStatus"),
  moneyGoalProgressLabel: document.querySelector("#moneyGoalProgressLabel"),
  moneyGoalProgressBar: document.querySelector("#moneyGoalProgressBar"),
  readyPlotProgressLabel: document.querySelector("#readyPlotProgressLabel"),
  readyPlotProgressBar: document.querySelector("#readyPlotProgressBar"),
  eventBanner: document.querySelector("#eventBanner"),
  eventTitle: document.querySelector("#eventTitle"),
  eventDescription: document.querySelector("#eventDescription"),
  eventEffect: document.querySelector("#eventEffect"),
  eventTags: document.querySelector("#eventTags"),
  eventTimer: document.querySelector("#eventTimer"),
  eventProgressBar: document.querySelector("#eventProgressBar"),
  marketBanner: document.querySelector("#marketBanner"),
  marketHeadline: document.querySelector("#marketHeadline"),
  marketSummary: document.querySelector("#marketSummary"),
  marketEffect: document.querySelector("#marketEffect"),
  marketPriceValue: document.querySelector("#marketPriceValue"),
  marketChangeIndicator: document.querySelector("#marketChangeIndicator"),
  marketTimer: document.querySelector("#marketTimer"),
  progressSummary: document.querySelector("#progressSummary"),
  goalList: document.querySelector("#goalList"),
  farmGrid: document.querySelector("#farmGrid"),
  buySeedButton: document.querySelector("#buySeedButton"),
  sellButton: document.querySelector("#sellButton"),
  resetButton: document.querySelector("#resetButton"),
  fertilizerButton: document.querySelector("#fertilizerButton"),
  marketButton: document.querySelector("#marketButton"),
  expandFarmButton: document.querySelector("#expandFarmButton"),
  helperButton: document.querySelector("#helperButton"),
  fertilizerDescription: document.querySelector("#fertilizerDescription"),
  marketDescription: document.querySelector("#marketDescription"),
  expansionDescription: document.querySelector("#expansionDescription"),
  helperDescription: document.querySelector("#helperDescription"),
};

const storage = createStorageAdapter();
const plotElements = [];
const debugState = {
  randomEventsEnabled: true,
  forcedMarketSteps: [],
};
const uiState = {
  milestoneToast: null,
  harvestedPlots: {},
};
let state = loadState();
let autosaveIntervalId = null;
let dirty = false;

attachEvents();
attachDebugHelpers();
render();
startTicker();
startAutosave();

function attachEvents() {
  elements.buySeedButton.addEventListener("click", buySeed);
  elements.sellButton.addEventListener("click", sellStrawberries);
  elements.resetButton.addEventListener("click", resetGame);
  elements.fertilizerButton.addEventListener("click", buyFertilizerUpgrade);
  elements.marketButton.addEventListener("click", buyMarketUpgrade);
  elements.expandFarmButton.addEventListener("click", expandFarm);
  elements.helperButton.addEventListener("click", buyHelperUpgrade);
  elements.helpToggleButton.addEventListener("click", toggleHelpPanel);
  elements.helpDismissButton.addEventListener("click", dismissHelpPanel);
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
    forceMilestoneToast(message) {
      showMilestoneToast(message);
      render();
    },
    setState(partialState) {
      state = hydrateState({ ...state, ...partialState });
      dirty = true;
      saveState();
      render();
    },
    setForcedMarketSteps(steps) {
      debugState.forcedMarketSteps = Array.isArray(steps) ? [...steps] : [];
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
    upgrades: {
      fertilizer: false,
      market: false,
      helper: false,
    },
    progression: {
      completedGoalIds: [],
    },
    ui: {
      helpOpen: true,
    },
    stats: {
      harvestedTotal: 0,
      soldTotal: 0,
      upgradesPurchased: 0,
      eventsTriggered: 0,
    },
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
      lastSavedAt: null,
    },
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

function getInitialHelperState() {
  return {
    nextHarvestAt: null,
    lastHarvestAt: null,
    lastPlotId: null,
    lastActionAt: null,
    lastActionText: "",
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
    const eventDefinition = getEventDefinition(savedActiveEvent.id);

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
    const nextPrice = normalizeMarketPrice(savedMarket.currentPrice);
    nextState.systems.market.currentPrice = nextPrice;
    nextState.systems.market.previousPrice = normalizeMarketPrice(savedMarket.previousPrice ?? nextPrice);
    nextState.systems.market.direction = getMarketDirection(
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

  const savedHelper = savedSystems?.helper || savedState.helper;

  if (savedHelper && typeof savedHelper === "object") {
    nextState.systems.helper.nextHarvestAt = Number.isFinite(savedHelper.nextHarvestAt)
      ? savedHelper.nextHarvestAt
      : null;
    nextState.systems.helper.lastHarvestAt = Number.isFinite(savedHelper.lastHarvestAt)
      ? savedHelper.lastHarvestAt
      : null;
    nextState.systems.helper.lastPlotId = Number.isFinite(savedHelper.lastPlotId)
      ? savedHelper.lastPlotId
      : null;
    nextState.systems.helper.lastActionAt = Number.isFinite(savedHelper.lastActionAt)
      ? savedHelper.lastActionAt
      : null;
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

  updateActiveEvent(nextState);
  updateMarketState(nextState);
  updateComboState(nextState);
  updateHelperState(nextState);
  updatePlotsByTime(nextState);
  return nextState;
}

function saveState() {
  state.systems.lastSavedAt = Date.now();
  storage.setItem(config.storageKey, JSON.stringify(state));
  dirty = false;
  renderSaveStatus();
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

function getVisiblePlots(targetState = state) {
  return targetState.plots.slice(0, targetState.unlockedPlotCount);
}

function getActiveEventDefinition(targetState = state) {
  if (!targetState.systems.activeEvent) {
    return null;
  }

  return getEventDefinition(targetState.systems.activeEvent.id);
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

function getMarketBasePrice(targetState = state) {
  return normalizeMarketPrice(targetState.systems.market.currentPrice);
}

function getSellPrice() {
  let sellPrice = getMarketBasePrice();

  if (state.upgrades.market) {
    sellPrice += config.upgrades.market.sellPriceBonus;
  }

  const activeEvent = getActiveEventDefinition();

  if (activeEvent?.sellPriceBonus) {
    sellPrice += activeEvent.sellPriceBonus;
  }

  return sellPrice;
}

function normalizeMarketPrice(price) {
  if (!Number.isFinite(price)) {
    return config.market.basePrice;
  }

  return Math.max(config.market.minPrice, Math.min(config.market.maxPrice, Math.round(price)));
}

function getRandomMarketStep() {
  if (debugState.forcedMarketSteps.length > 0) {
    return debugState.forcedMarketSteps.shift();
  }

  const randomIndex = Math.floor(Math.random() * config.market.stepOptions.length);
  return config.market.stepOptions[randomIndex];
}

function getMarketDirection(currentPrice, previousPrice) {
  if (currentPrice > previousPrice) {
    return "up";
  }

  if (currentPrice < previousPrice) {
    return "down";
  }

  return "steady";
}

function updateMarketState(targetState = state) {
  const market = targetState.systems.market;

  if (!market || !Number.isFinite(market.nextUpdateAt)) {
    return false;
  }

  let changed = false;
  let guard = 0;

  while (Date.now() >= market.nextUpdateAt && guard < 6) {
    const previousPrice = normalizeMarketPrice(market.currentPrice);
    const nextPrice = normalizeMarketPrice(previousPrice + getRandomMarketStep());

    market.previousPrice = previousPrice;
    market.currentPrice = nextPrice;
    market.direction = getMarketDirection(nextPrice, previousPrice);
    market.nextUpdateAt += config.market.updateIntervalMs;
    changed = true;
    guard += 1;
  }

  if (market.nextUpdateAt < Date.now()) {
    market.nextUpdateAt = Date.now() + config.market.updateIntervalMs;
  }

  return changed;
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
  const marketBasePrice = getMarketBasePrice();
  const quantity = state.strawberries;
  const earnedMoney = quantity * sellPrice;
  state.money += earnedMoney;
  state.strawberries = 0;
  state.stats.soldTotal += quantity;
  setMessage(`Você vendeu ${quantity} morango${quantity > 1 ? "s" : ""} por ${earnedMoney} moedas. Mercado base: ${marketBasePrice}.`);
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

function buyHelperUpgrade() {
  const upgrade = config.upgrades.helper;

  if (state.upgrades.helper) {
    setMessage("O Farm Helper já está ativo.");
    render();
    return;
  }

  if (state.money < upgrade.cost) {
    setMessage("Você ainda não tem moedas suficientes para comprar o Farm Helper.");
    render();
    return;
  }

  state.money -= upgrade.cost;
  state.upgrades.helper = true;
  state.stats.upgradesPurchased += 1;
  state.systems.helper.nextHarvestAt = Date.now() + upgrade.harvestIntervalMs;
  state.systems.helper.lastActionAt = Date.now();
  state.systems.helper.lastActionText = "Farm Helper ativado. Ele vai colher plantas prontas automaticamente.";
  setMessage("Farm Helper comprado. Agora ele ajuda a colher canteiros prontos.");
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
  uiState.milestoneToast = null;
  saveState();
  render();
}

function toggleHelpPanel() {
  state.ui.helpOpen = !state.ui.helpOpen;
  dirty = true;
  saveState();
  render();
}

function dismissHelpPanel() {
  state.ui.helpOpen = false;
  dirty = true;
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
  harvestPlotWithSource(plot, "manual");
}

function harvestPlotWithSource(plot, source) {
  const isHelperHarvest = source === "helper";
  const comboSummary = isHelperHarvest ? { count: 0, bonusMoney: 0 } : applyHarvestCombo();
  plot.state = config.plotStates.empty;
  plot.plantedAt = null;
  plot.readyAt = null;
  plot.growthDurationMs = null;
  state.strawberries += config.crop.harvestYield;
  state.stats.harvestedTotal += config.crop.harvestYield;
  markPlotHarvested(plot.id, source);

  if (isHelperHarvest) {
    noteHelperHarvest(plot.id);
  } else if (comboSummary.bonusMoney > 0) {
    state.money += comboSummary.bonusMoney;
    setMessage(`Você colheu 1 morango. Combo x${comboSummary.count}: +${comboSummary.bonusMoney} moeda bônus.`);
  } else if (comboSummary.count >= 2) {
    setMessage(`Você colheu 1 morango. Combo x${comboSummary.count} ativo.`);
  } else {
    setMessage("Você colheu 1 morango.");
  }

  commit();
}

function applyHarvestCombo() {
  const now = Date.now();
  const combo = state.systems.combo;
  const comboStillActive = Number.isFinite(combo.expiresAt) && now <= combo.expiresAt;

  if (comboStillActive) {
    combo.count += 1;
  } else {
    combo.count = 1;
    combo.lastRewardedThreshold = 0;
    combo.rewardMoney = 0;
  }

  combo.lastHarvestAt = now;
  combo.expiresAt = now + config.combo.windowMs;

  const unlockedThreshold = getUnlockedComboThreshold(combo.count, combo.lastRewardedThreshold);
  const bonusMoney = unlockedThreshold ? unlockedThreshold.moneyBonus : 0;

  if (unlockedThreshold) {
    combo.lastRewardedThreshold = unlockedThreshold.count;
    combo.rewardMoney = bonusMoney;
  } else if (!comboStillActive) {
    combo.rewardMoney = 0;
  }

  return {
    count: combo.count,
    bonusMoney,
  };
}

function getUnlockedComboThreshold(count, lastRewardedThreshold) {
  return (
    [...config.combo.thresholds]
      .sort((left, right) => left.count - right.count)
      .find((threshold) => count >= threshold.count && threshold.count > lastRewardedThreshold) || null
  );
}

function noteHelperHarvest(plotId) {
  state.systems.helper.lastHarvestAt = Date.now();
  state.systems.helper.lastPlotId = plotId;
  state.systems.helper.lastActionAt = Date.now();
  state.systems.helper.lastActionText = `Farm Helper colheu o canteiro ${plotId + 1}.`;
}

function markPlotHarvested(plotId, source = "manual") {
  uiState.harvestedPlots[plotId] = {
    until: Date.now() + 450,
    source,
  };
}

function syncHarvestEffects() {
  const now = Date.now();

  Object.keys(uiState.harvestedPlots).forEach((plotId) => {
    if (uiState.harvestedPlots[plotId].until <= now) {
      delete uiState.harvestedPlots[plotId];
    }
  });
}

function maybeTriggerRandomEvent() {
  if (
    !debugState.randomEventsEnabled ||
    state.systems.activeEvent ||
    Math.random() > config.events.triggerChanceOnSell
  ) {
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

  state.systems.activeEvent = {
    id: eventDefinition.id,
    endsAt: Date.now() + durationMs,
    durationMs,
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

  getVisiblePlots().forEach((plot) => {
    if (plot.state !== config.plotStates.growing || !Number.isFinite(plot.readyAt)) {
      return;
    }

    const remaining = Math.max(0, plot.readyAt - now);
    const nextRemaining = Math.max(1000, Math.floor(remaining * remainingMultiplier));
    plot.readyAt = now + nextRemaining;

    if (Number.isFinite(plot.plantedAt)) {
      plot.growthDurationMs = Math.max(1000, now - plot.plantedAt + nextRemaining);
    }
  });
}

function clearActiveEvent() {
  state.systems.activeEvent = null;
}

function updateActiveEvent(targetState = state) {
  if (!targetState.systems.activeEvent) {
    return false;
  }

  if (Date.now() < targetState.systems.activeEvent.endsAt) {
    return false;
  }

  targetState.systems.activeEvent = null;
  return true;
}

function updateComboState(targetState = state) {
  const combo = targetState.systems.combo;

  if (!combo || !Number.isFinite(combo.expiresAt)) {
    return false;
  }

  if (Date.now() < combo.expiresAt) {
    return false;
  }

  resetCombo(targetState);
  return true;
}

function updateHelperState(targetState = state) {
  const helper = targetState.systems.helper;

  if (!helper) {
    return false;
  }

  if (!targetState.upgrades.helper) {
    targetState.systems.helper = getInitialHelperState();
    return false;
  }

  if (!Number.isFinite(helper.nextHarvestAt)) {
    helper.nextHarvestAt = Date.now() + config.upgrades.helper.harvestIntervalMs;
    return true;
  }

  return false;
}

function resetCombo(targetState = state) {
  targetState.systems.combo = {
    count: 0,
    lastHarvestAt: null,
    expiresAt: null,
    lastRewardedThreshold: 0,
    rewardMoney: 0,
  };
}

function updatePlotsByTime(targetState = state) {
  const now = Date.now();
  let changed = false;

  getVisiblePlots(targetState).forEach((plot) => {
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
    const marketChanged = updateMarketState();
    const comboExpired = updateComboState();
    const plotsReady = updatePlotsByTime();
    const helperHarvested = runFarmHelper();
    syncHarvestEffects();

    if (eventEnded) {
      setMessage("O evento terminou.");
      dirty = true;
      render();
      return;
    }

    if (marketChanged) {
      setMessage(getMarketUpdateMessage());
      dirty = true;
      render();
      return;
    }

    if (helperHarvested) {
      return;
    }

    if (comboExpired) {
      renderLiveState();
      return;
    }

    if (plotsReady) {
      setMessage("Um morango está pronto para colher.");
      dirty = true;
      render();
      return;
    }

    renderLiveState();
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
  updateMarketState();
  updateComboState();
  updateHelperState();
  updatePlotsByTime();
  const goalRewards = applyProgressionGoals();

  if (goalRewards.length > 0) {
    setMessage(goalRewards.join(" "));
    showMilestoneToast(goalRewards[goalRewards.length - 1]);
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
  updateComboState();
  updatePlotsByTime();
  syncHarvestEffects();
  syncMilestoneToast();

  const farmMetrics = getFarmMetrics();
  renderStaticState(farmMetrics);
  renderLiveState(farmMetrics);
}

function renderStaticState(farmMetrics = getFarmMetrics()) {
  document.title = config.title;
  elements.moneyCount.textContent = String(state.money);
  elements.seedCount.textContent = String(state.seeds);
  elements.berryCount.textContent = String(state.strawberries);
  elements.sellPriceValue.textContent = `${getSellPrice()} moedas`;
  elements.sellPriceHint.textContent = getSellPriceHint();
  elements.growthTimeValue.textContent = formatSeconds(getGrowthTimeMs());
  elements.plotCountValue.textContent = `${state.unlockedPlotCount}/${config.maxPlotCount}`;
  elements.statusMessage.textContent = state.message;
  renderSaveStatus();
  renderGoalStatus();
  renderStatHighlights();
  renderPrimaryActions();
  renderHelperCard();
  renderHelpPanel();
  renderUpgradeCards();
  renderProgression();
}

function renderLiveState(farmMetrics = getFarmMetrics()) {
  syncHarvestEffects();
  syncMilestoneToast();
  renderHelperCard();
  renderProgressIndicators(farmMetrics);
  renderComboStrip();
  renderHelperStrip();
  renderMilestoneToast();
  renderEventBanner();
  renderMarketBanner();
  renderFarmGrid(farmMetrics);
}

function renderGoalStatus() {
  const hasWon = state.progression.completedGoalIds.includes("reach-35");
  elements.goalStatus.textContent = hasWon
    ? "Você construiu uma pequena fazenda de morangos!"
    : `Meta: alcançar ${config.winMoney} moedas`;
  elements.goalStatus.classList.toggle("goal--won", hasWon);
}

function renderSaveStatus() {
  elements.saveStatus.textContent = getSaveStatusText();
}

function renderPrimaryActions() {
  const seedPrice = getSeedPrice();
  const activeEvent = getActiveEventDefinition();
  const marketBasePrice = getMarketBasePrice();
  elements.buySeedButton.disabled = state.money < seedPrice;
  elements.buySeedButton.textContent = `Comprar semente (${seedPrice})`;
  elements.sellButton.disabled = state.strawberries <= 0;
  elements.fertilizerButton.disabled =
    state.upgrades.fertilizer || state.money < config.upgrades.fertilizer.cost;
  elements.marketButton.disabled = state.upgrades.market || state.money < config.upgrades.market.cost;
  elements.expandFarmButton.disabled = state.hasExpandedFarm || state.money < config.expansion.cost;
  elements.helperButton.disabled = state.upgrades.helper || state.money < config.upgrades.helper.cost;

  elements.fertilizerButton.textContent = state.upgrades.fertilizer
    ? "Adubo ativo"
    : `Comprar adubo (${config.upgrades.fertilizer.cost})`;
  elements.marketButton.textContent = state.upgrades.market
    ? "Venda melhorada"
    : `Melhorar venda (${config.upgrades.market.cost})`;
  elements.expandFarmButton.textContent = state.hasExpandedFarm
    ? "Fazenda expandida"
    : `Expandir fazenda (${config.expansion.cost})`;
  elements.helperButton.textContent = state.upgrades.helper
    ? "Farm Helper ativo"
    : `Comprar helper (${config.upgrades.helper.cost})`;

  elements.buySeedButton.classList.toggle("action-btn--highlight", Boolean(activeEvent?.seedPriceDiscount));
  elements.sellButton.classList.toggle(
    "action-btn--highlight",
    Boolean(activeEvent?.sellPriceBonus) || marketBasePrice >= config.market.maxPrice,
  );
  elements.fertilizerButton.classList.toggle("action-btn--highlight", Boolean(activeEvent?.growthMultiplier));
  elements.helperButton.classList.toggle("action-btn--highlight", state.upgrades.helper);
}

function renderUpgradeCards() {
  elements.fertilizerDescription.textContent = state.upgrades.fertilizer
    ? `Ativo: novos plantios levam ${formatSeconds(getGrowthTimeMs())}.`
    : config.upgrades.fertilizer.description;
  elements.marketDescription.textContent = state.upgrades.market
    ? `Ativo: cada morango vendido vale ${getSellPrice()} moedas${getActiveEventDefinition()?.sellPriceBonus ? " durante o evento." : "."}`
    : config.upgrades.market.description;
  elements.expansionDescription.textContent = state.hasExpandedFarm
    ? "Ativo: todos os 16 canteiros estão liberados."
    : config.expansion.description;
  elements.helperDescription.textContent = state.upgrades.helper
    ? `Ativo: colhe 1 canteiro pronto a cada ${formatSeconds(config.upgrades.helper.harvestIntervalMs)} sem usar combo.`
    : config.upgrades.helper.description;
}

function renderEventBanner() {
  const activeEvent = getActiveEventDefinition();

  if (!activeEvent || !state.systems.activeEvent) {
    elements.eventBanner.className = "event-banner event-banner--idle";
    elements.eventTitle.textContent = "Nenhum evento ativo";
    elements.eventDescription.textContent =
      "Venda morangos para ter chance de ativar um evento curto.";
    elements.eventEffect.textContent = "Sem bônus ativo no momento.";
    elements.eventTags.hidden = true;
    elements.eventTags.innerHTML = "";
    elements.eventTimer.textContent = "Aguardando";
    elements.eventProgressBar.style.width = "0%";
    return;
  }

  const remainingMs = Math.max(0, state.systems.activeEvent.endsAt - Date.now());
  const totalDurationMs = getEventDurationMs(activeEvent);
  const progressPercent = totalDurationMs > 0 ? (remainingMs / totalDurationMs) * 100 : 0;
  elements.eventBanner.className = `event-banner ${activeEvent.accentClass}`;
  elements.eventTitle.textContent = activeEvent.title;
  elements.eventDescription.textContent = activeEvent.description;
  elements.eventEffect.textContent = getEventEffectText(activeEvent);
  renderEventTags(activeEvent);
  elements.eventTimer.textContent = `Termina em ${formatSeconds(remainingMs)}`;
  elements.eventProgressBar.style.width = `${Math.max(0, Math.min(100, progressPercent))}%`;
}

function renderMarketBanner() {
  const market = state.systems.market;
  const marketBasePrice = getMarketBasePrice();
  const finalSellPrice = getSellPrice();
  const remainingMs = Math.max(0, market.nextUpdateAt - Date.now());
  const activeEvent = getActiveEventDefinition();

  elements.marketBanner.className = `market-banner market-banner--${market.direction}`;
  elements.marketHeadline.textContent = getMarketHeadline();
  elements.marketSummary.textContent = getMarketDescription();
  elements.marketEffect.textContent = activeEvent?.sellPriceBonus
    ? `Preço base: ${marketBasePrice} moedas. Com bônus ativos, você vende por ${finalSellPrice}.`
    : `Preço base atual: ${marketBasePrice} moedas por morango.`;
  elements.marketPriceValue.textContent = `${marketBasePrice} moedas`;
  elements.marketChangeIndicator.textContent = getMarketChangeText();
  elements.marketTimer.textContent = `Atualiza em ${formatSeconds(remainingMs)}`;
}

function renderFarmGrid(farmMetrics) {
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
    plotElement.badge.textContent = getPlotBadge(plot);
    plotElement.emoji.textContent = getPlotEmoji(plot);
    plotElement.name.textContent = getPlotName(plot);
    plotElement.stage.textContent = getPlotStageText(plot);
    plotElement.timer.textContent = getPlotTimerText(plot);
    plotElement.hint.textContent = getPlotHint(plot);
    plotElement.progressFill.style.width = `${progress}%`;
    plotElement.progressTrack.hidden = plot.state !== config.plotStates.growing;
    plotElement.button.classList.toggle("plot--attention", plot.state === config.plotStates.ready && farmMetrics.readyPlots > 0);
    plotElement.button.classList.toggle("plot--harvested", uiState.harvestedPlots[plot.id]?.source === "manual");
    plotElement.button.classList.toggle("plot--harvested-auto", uiState.harvestedPlots[plot.id]?.source === "helper");
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

    const badge = document.createElement("div");
    badge.className = "plot__badge";

    const name = document.createElement("div");
    name.className = "plot__name";

    const stage = document.createElement("div");
    stage.className = "plot__stage";

    const timer = document.createElement("div");
    timer.className = "plot__timer";

    const progressTrack = document.createElement("div");
    progressTrack.className = "plot__progress";

    const progressFill = document.createElement("div");
    progressFill.className = "plot__progress-fill";
    progressTrack.append(progressFill);

    const hint = document.createElement("div");
    hint.className = "plot__hint";

    plotButton.append(badge, emoji, name, stage, timer, progressTrack, hint);
    elements.farmGrid.append(plotButton);
    plotElements.push({
      button: plotButton,
      badge,
      emoji,
      name,
      stage,
      timer,
      progressTrack,
      progressFill,
      hint,
    });
  });
}

function renderComboStrip() {
  const combo = state.systems.combo;
  const isActive = combo.count >= 2 && Number.isFinite(combo.expiresAt) && Date.now() < combo.expiresAt;

  elements.comboStrip.hidden = !isActive;

  if (!isActive) {
    return;
  }

  const remainingMs = Math.max(0, combo.expiresAt - Date.now());
  const progressPercent = (remainingMs / config.combo.windowMs) * 100;
  const nextThreshold = getNextComboThreshold(combo.count);
  const rewardText = combo.rewardMoney > 0 ? ` +${combo.rewardMoney} moeda bônus` : "";

  elements.comboTitle.textContent = `Combo x${combo.count}${rewardText}`;
  elements.comboText.textContent = nextThreshold
    ? `Colha outro canteiro em sequência para buscar o combo x${nextThreshold.count}.`
    : "Combo máximo deste sprint alcançado.";
  elements.comboTimer.textContent = `Expira em ${formatSeconds(remainingMs)}`;
  elements.comboProgressBar.style.width = `${Math.max(0, Math.min(100, progressPercent))}%`;
}

function renderHelperCard() {
  const isActive = state.upgrades.helper;
  const nextHarvestAt = state.systems.helper.nextHarvestAt;

  elements.helperStatusValue.textContent = isActive ? "Ativo" : "Desligado";
  elements.helperStatusHint.textContent =
    isActive && Number.isFinite(nextHarvestAt)
      ? `Próxima verificação em ${formatSeconds(Math.max(0, nextHarvestAt - Date.now()))}.`
      : "Compre para colher 1 canteiro pronto automaticamente.";
  elements.helperCard.classList.toggle("stat--highlight", isActive);
}

function renderHelperStrip() {
  const isActive = state.upgrades.helper;
  elements.helperStrip.hidden = !isActive;

  if (!isActive) {
    return;
  }

  const helper = state.systems.helper;
  const nextHarvestAt = Number.isFinite(helper.nextHarvestAt)
    ? Math.max(0, helper.nextHarvestAt - Date.now())
    : config.upgrades.helper.harvestIntervalMs;
  const recentAction = Number.isFinite(helper.lastActionAt) && Date.now() - helper.lastActionAt < 2800;

  elements.helperStripText.textContent =
    recentAction && helper.lastActionText
      ? helper.lastActionText
      : "Ativo: colhe 1 canteiro pronto por ciclo e não gera combo.";
  elements.helperStripTimer.textContent = `Próxima verificação em ${formatSeconds(nextHarvestAt)}`;
}

function renderEventTags(activeEvent) {
  const tags = getEventTags(activeEvent);

  elements.eventTags.hidden = tags.length === 0;
  elements.eventTags.innerHTML = "";

  tags.forEach((tag) => {
    const tagElement = document.createElement("span");
    tagElement.className = "event-banner__tag";
    tagElement.textContent = tag;
    elements.eventTags.append(tagElement);
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

    const progressBar = document.createElement("div");
    progressBar.className = "goal-item__bar";

    const progressFill = document.createElement("div");
    progressFill.className = "goal-item__fill";
    progressFill.style.width = `${getGoalPercent(goal)}%`;
    progressBar.append(progressFill);

    item.append(title, description, meta, progressBar);
    elements.goalList.append(item);
  });
}

function renderHelpPanel() {
  elements.helpPanel.hidden = !state.ui.helpOpen;
  elements.helpToggleButton.textContent = state.ui.helpOpen ? "Ocultar ajuda" : "Ajuda rápida";
  elements.helpToggleButton.setAttribute("aria-expanded", String(state.ui.helpOpen));
}

function renderProgressIndicators(farmMetrics) {
  const moneyProgressPercent = (Math.min(state.money, config.winMoney) / config.winMoney) * 100;
  const readyProgressPercent =
    farmMetrics.unlockedPlots > 0 ? (farmMetrics.readyPlots / farmMetrics.unlockedPlots) * 100 : 0;

  elements.moneyGoalProgressLabel.textContent = `${state.money} / ${config.winMoney} moedas`;
  elements.moneyGoalProgressBar.style.width = `${Math.max(0, Math.min(100, moneyProgressPercent))}%`;
  elements.readyPlotProgressLabel.textContent = `${farmMetrics.readyPlots} / ${farmMetrics.unlockedPlots}`;
  elements.readyPlotProgressBar.style.width = `${Math.max(0, Math.min(100, readyProgressPercent))}%`;
}

function renderMilestoneToast() {
  const toast = uiState.milestoneToast;
  const isVisible = Boolean(toast && toast.visibleUntil > Date.now());

  elements.milestoneToast.hidden = !isVisible;

  if (!isVisible) {
    return;
  }

  elements.milestoneToastText.textContent = toast.message;
}

function showMilestoneToast(message) {
  uiState.milestoneToast = {
    message,
    visibleUntil: Date.now() + 5000,
  };
}

function syncMilestoneToast() {
  if (uiState.milestoneToast && uiState.milestoneToast.visibleUntil <= Date.now()) {
    uiState.milestoneToast = null;
  }
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

function getGoalPercent(goal) {
  if (goal.targetType === "expandedFarm") {
    return state.hasExpandedFarm ? 100 : 0;
  }

  const current = getGoalCurrentValue(goal);
  return Math.max(0, Math.min(100, (current / goal.targetValue) * 100));
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

function getPlotBadge(plot) {
  if (plot.state === config.plotStates.growing) {
    return "Aguarde";
  }

  if (plot.state === config.plotStates.ready) {
    return "Colher";
  }

  return "Plantar";
}

function getPlotStageText(plot) {
  if (plot.state === config.plotStates.empty) {
    return "Pronto para plantar";
  }

  if (plot.state === config.plotStates.ready) {
    return "Madura";
  }

  const progress = getPlotProgress(plot);

  if (progress < 34) {
    return "Brotando";
  }

  if (progress < 67) {
    return "Crescendo";
  }

  return "Quase pronto";
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
    return "Clique agora para colher";
  }

  return "Clique para plantar";
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
  return `Canteiro ${index + 1}: ${getPlotName(plot)}. Etapa: ${getPlotStageText(plot)}. ${getPlotTimerText(plot)}. ${getPlotHint(plot)}`;
}

function getSaveStatusText() {
  if (!storage.isPersistent) {
    return "Salvamento local indisponível neste arquivo.";
  }

  if (dirty) {
    return "Salvando automaticamente...";
  }

  if (Number.isFinite(state.systems.lastSavedAt)) {
    return `Salvo automaticamente às ${formatClock(state.systems.lastSavedAt)}.`;
  }

  return "Salvamento automático ativo.";
}

function getSellPriceHint() {
  const marketBasePrice = getMarketBasePrice();
  const direction = state.systems.market.direction;

  if (direction === "up") {
    return `Mercado subiu para ${marketBasePrice}.`;
  }

  if (direction === "down") {
    return `Mercado caiu para ${marketBasePrice}.`;
  }

  return `Mercado em ${marketBasePrice} moedas.`;
}

function getFarmMetrics() {
  const visiblePlots = getVisiblePlots();
  const readyPlots = visiblePlots.filter((plot) => plot.state === config.plotStates.ready).length;
  const growingPlots = visiblePlots.filter((plot) => plot.state === config.plotStates.growing).length;

  return {
    unlockedPlots: state.unlockedPlotCount,
    readyPlots,
    growingPlots,
  };
}

function runFarmHelper() {
  if (!state.upgrades.helper) {
    return false;
  }

  updateHelperState();

  const helper = state.systems.helper;

  if (!Number.isFinite(helper.nextHarvestAt) || Date.now() < helper.nextHarvestAt) {
    return false;
  }

  helper.nextHarvestAt = Date.now() + config.upgrades.helper.harvestIntervalMs;

  const readyPlot = getVisiblePlots().find((plot) => plot.state === config.plotStates.ready);

  if (!readyPlot) {
    return false;
  }

  harvestPlotWithSource(readyPlot, "helper");
  return true;
}

function renderStatHighlights() {
  clearStatHighlights();

  const activeEvent = getActiveEventDefinition();

  if (!activeEvent) {
    return;
  }

  if (activeEvent.sellPriceBonus) {
    elements.sellPriceCard.classList.add("stat--highlight");
    elements.moneyCard.classList.add("stat--highlight");
  }

  if (activeEvent.seedPriceDiscount) {
    elements.seedCard.classList.add("stat--highlight");
  }

  if (activeEvent.growthMultiplier) {
    elements.growthTimeCard.classList.add("stat--highlight");
    elements.plotCountCard.classList.add("stat--highlight");
  }
}

function clearStatHighlights() {
  [
    elements.moneyCard,
    elements.seedCard,
    elements.berryCard,
    elements.sellPriceCard,
    elements.growthTimeCard,
    elements.plotCountCard,
    elements.helperCard,
  ].forEach((element) => element.classList.remove("stat--highlight"));
}

function getEventEffectText(activeEvent) {
  if (activeEvent.sellPriceBonus) {
    return `Efeito: +${activeEvent.sellPriceBonus} moeda por morango vendido.`;
  }

  if (activeEvent.seedPriceDiscount) {
    return `Efeito: sementes por ${getSeedPrice()} moeda.`;
  }

  if (activeEvent.growthMultiplier) {
    return `Efeito: crescimento atual em ${formatSeconds(getGrowthTimeMs())}.`;
  }

  return "Sem bônus ativo no momento.";
}

function getMarketHeadline() {
  const marketBasePrice = getMarketBasePrice();
  const direction = state.systems.market.direction;

  if (direction === "up") {
    return `Preço em alta: ${marketBasePrice} moedas`;
  }

  if (direction === "down") {
    return `Preço em baixa: ${marketBasePrice} moedas`;
  }

  return `Preço estável: ${marketBasePrice} moedas`;
}

function getMarketDescription() {
  const marketBasePrice = getMarketBasePrice();

  if (marketBasePrice === config.market.maxPrice) {
    return "Este é um ótimo momento para vender e converter estoque em moedas.";
  }

  if (marketBasePrice === config.market.minPrice) {
    return "O mercado está fraco. Você pode esperar alguns segundos antes de vender.";
  }

  return "O mercado muda sozinho com o tempo. Venda no melhor momento.";
}

function getMarketChangeText() {
  const market = state.systems.market;
  const difference = market.currentPrice - market.previousPrice;

  if (difference > 0) {
    return `▲ +${difference} desde a última virada`;
  }

  if (difference < 0) {
    return `▼ ${difference} desde a última virada`;
  }

  return "• Sem mudança na última virada";
}

function getMarketUpdateMessage() {
  const marketBasePrice = getMarketBasePrice();
  const direction = state.systems.market.direction;

  if (direction === "up") {
    return `Mercado em alta. O morango agora vale ${marketBasePrice} moedas antes dos bônus.`;
  }

  if (direction === "down") {
    return `Mercado em baixa. O morango agora vale ${marketBasePrice} moedas antes dos bônus.`;
  }

  return `Mercado estável. O morango segue valendo ${marketBasePrice} moedas antes dos bônus.`;
}

function getEventTags(activeEvent) {
  const tags = [];

  if (activeEvent.sellPriceBonus) {
    tags.push("Afeta vendas");
  }

  if (activeEvent.seedPriceDiscount) {
    tags.push("Afeta compra de sementes");
  }

  if (activeEvent.growthMultiplier) {
    tags.push("Afeta crescimento");
  }

  if (activeEvent.activePlotRemainingMultiplier) {
    tags.push("Acelera canteiros já plantados");
  }

  return tags;
}

function getEventDurationMs(eventDefinition) {
  if (!state.systems.activeEvent || !eventDefinition) {
    return config.events.durationMs;
  }

  return state.systems.activeEvent.durationMs || config.events.durationMs;
}

function getNextComboThreshold(count) {
  return config.combo.thresholds.find((threshold) => threshold.count > count) || null;
}

function formatClock(timestamp) {
  return new Date(timestamp).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
