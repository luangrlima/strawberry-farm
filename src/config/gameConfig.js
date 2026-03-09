window.StrawberryFarm = window.StrawberryFarm || {};

window.StrawberryFarm.config = {
  title: "Fazenda de Morangos",
  storageKey: "strawberry-farm-save",
  initialPlotCount: 9,
  maxPlotCount: 16,
  winMoney: 35,
  autosaveIntervalMs: 4000,
  prestige: {
    label: "Strawberry Knowledge",
    baseThresholdMoney: 120,
    sellBonusPerLevel: 0.2,
    description: "Reinicie para ganhar +20% permanente nas vendas por nível.",
  },
  market: {
    basePrice: 3,
    minPrice: 2,
    maxPrice: 5,
    updateIntervalMs: 12000,
    stepOptions: [-1, 0, 1],
  },
  combo: {
    windowMs: 1800,
    thresholds: [
      { count: 3, moneyBonus: 1 },
      { count: 5, moneyBonus: 2 },
    ],
  },
  crop: {
    name: "Morango",
    growthTimeMs: 10000,
    harvestYield: 1,
    sellPrice: 3,
    seedPrice: 2,
  },
  upgrades: {
    fertilizer: {
      label: "Adubo rápido",
      cost: 10,
      growthMultiplier: 0.75,
      description: "-25% no tempo.",
    },
    market: {
      label: "Caixa premium",
      cost: 14,
      sellPriceBonus: 2,
      description: "+2 moedas por venda.",
    },
    helper: {
      label: "Farm Helper",
      cost: 18,
      harvestIntervalMs: 3500,
      description: "Colhe 1 pronto por ciclo.",
    },
    helperPlanting: {
      label: "Bolsa de sementes",
      cost: 22,
      description: "O Helper planta 1 vazio por ciclo se nao houver colheita. Consome sementes.",
    },
  },
  expansion: {
    cost: 10,
    label: "Expandir fazenda",
    description: "+7 canteiros.",
  },
  events: {
    durationMs: 12000,
    triggerChanceOnSell: 0.35,
    definitions: [
      {
        id: "sunshine",
        title: "Sol forte",
        description: "+1 moeda por venda.",
        type: "sellBonus",
        sellPriceBonus: 1,
        accentClass: "event-banner--sunshine",
      },
      {
        id: "drizzle",
        title: "Chuva leve",
        description: "Crescimento acelerado.",
        type: "growthBoost",
        growthMultiplier: 0.8,
        activePlotRemainingMultiplier: 0.8,
        accentClass: "event-banner--drizzle",
      },
      {
        id: "market-day",
        title: "Feira local",
        description: "Sementes com desconto.",
        type: "seedDiscount",
        seedPriceDiscount: 1,
        accentClass: "event-banner--market",
      },
    ],
  },
  progressionGoals: [
    {
      id: "harvest-3",
      title: "Primeira colheita",
      description: "Colha 4 morangos ao todo.",
      targetType: "harvestedTotal",
      targetValue: 4,
      reward: {
        money: 4,
      },
    },
    {
      id: "expand-farm",
      title: "Fazenda maior",
      description: "Expanda a fazenda para 4x4.",
      targetType: "expandedFarm",
      targetValue: 1,
      reward: {
        seeds: 4,
      },
    },
    {
      id: "buy-upgrade",
      title: "Ferramentas melhores",
      description: "Compre 2 melhorias.",
      targetType: "upgradesPurchased",
      targetValue: 2,
      reward: {
        money: 5,
      },
    },
    {
      id: "reach-35",
      title: "Fazenda rentável",
      description: "Alcance 35 moedas.",
      targetType: "money",
      targetValue: 35,
      reward: null,
    },
  ],
  startingState: {
    money: 6,
    seeds: 3,
    strawberries: 0,
  },
  plotStates: {
    empty: "empty",
    growing: "growing",
    ready: "ready",
  },
};
