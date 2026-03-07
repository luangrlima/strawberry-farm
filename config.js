window.STRAWBERRY_CONFIG = {
  title: "Fazenda de Morangos",
  storageKey: "strawberry-farm-save",
  gridSize: 9,
  winMoney: 20,
  crop: {
    name: "Morango",
    growthTimeMs: 10000,
    harvestYield: 1,
    sellPrice: 3,
    seedPrice: 2,
  },
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
