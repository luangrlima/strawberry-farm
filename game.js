const config = window.STRAWBERRY_CONFIG;

const elements = {
  moneyCount: document.querySelector("#moneyCount"),
  seedCount: document.querySelector("#seedCount"),
  berryCount: document.querySelector("#berryCount"),
  goalStatus: document.querySelector("#goalStatus"),
  statusMessage: document.querySelector("#statusMessage"),
  farmGrid: document.querySelector("#farmGrid"),
  buySeedButton: document.querySelector("#buySeedButton"),
  sellButton: document.querySelector("#sellButton"),
  resetButton: document.querySelector("#resetButton"),
};

const storage = createStorageAdapter();
const plotElements = [];
let state = loadState();
let tickIntervalId = null;

render();
startTicker();

elements.buySeedButton.addEventListener("click", buySeed);
elements.sellButton.addEventListener("click", sellStrawberries);
elements.resetButton.addEventListener("click", resetGame);

function createInitialState() {
  return {
    money: config.startingState.money,
    seeds: config.startingState.seeds,
    strawberries: config.startingState.strawberries,
    plots: Array.from({ length: config.gridSize }, (_, index) => ({
      id: index,
      state: config.plotStates.empty,
      plantedAt: null,
      readyAt: null,
    })),
    message: "Plante seus primeiros morangos.",
  };
}

function loadState() {
  const saved = storage.getItem(config.storageKey);

  if (!saved) {
    const initialState = createInitialState();

    if (!storage.isPersistent) {
      initialState.message = "Seu navegador bloqueou o salvamento local neste arquivo. O jogo funciona, mas sem salvar progresso.";
    }

    return initialState;
  }

  try {
    const parsedState = JSON.parse(saved);
    return hydrateState(parsedState);
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
      };
    });
  }

  updatePlotsByTime(nextState);
  return nextState;
}

function saveState() {
  storage.setItem(config.storageKey, JSON.stringify(state));
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

function buySeed() {
  if (state.money < config.crop.seedPrice) {
    setMessage("Você não tem moedas suficientes para comprar uma semente.");
    render();
    return;
  }

  state.money -= config.crop.seedPrice;
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

  const earnedMoney = state.strawberries * config.crop.sellPrice;
  state.money += earnedMoney;
  state.strawberries = 0;
  setMessage(`Você vendeu morangos por ${earnedMoney} moedas.`);
  commit();
}

function resetGame() {
  const shouldReset = window.confirm("Reiniciar todo o progresso?");

  if (!shouldReset) {
    return;
  }

  state = createInitialState();
  saveState();
  render();
}

function handlePlotClick(plotIndex) {
  const plot = state.plots[plotIndex];

  if (!plot) {
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
  plot.state = config.plotStates.growing;
  plot.plantedAt = now;
  plot.readyAt = now + config.crop.growthTimeMs;
  state.seeds -= 1;
  setMessage("Semente plantada. Volte em alguns segundos.");
  commit();
}

function harvestPlot(plot) {
  plot.state = config.plotStates.empty;
  plot.plantedAt = null;
  plot.readyAt = null;
  state.strawberries += config.crop.harvestYield;
  setMessage("Você colheu 1 morango.");
  commit();
}

function updatePlotsByTime(targetState = state) {
  const now = Date.now();
  let changed = false;

  targetState.plots.forEach((plot) => {
    if (plot.state === config.plotStates.growing && Number.isFinite(plot.readyAt) && now >= plot.readyAt) {
      plot.state = config.plotStates.ready;
      plot.plantedAt = null;
      plot.readyAt = null;
      changed = true;
    }
  });

  return changed;
}

function startTicker() {
  tickIntervalId = window.setInterval(() => {
    const changed = updatePlotsByTime();

    if (changed) {
      setMessage("Um morango está pronto para colher.");
      saveState();
    }

    render();
  }, 250);
}

function commit() {
  updatePlotsByTime();
  saveState();
  render();
}

function setMessage(message) {
  state.message = message;
}

function render() {
  updatePlotsByTime();

  document.title = config.title;
  elements.moneyCount.textContent = String(state.money);
  elements.seedCount.textContent = String(state.seeds);
  elements.berryCount.textContent = String(state.strawberries);
  elements.statusMessage.textContent = state.message;

  const hasWon = state.money >= config.winMoney;
  elements.goalStatus.textContent = hasWon
    ? "Você construiu uma pequena fazenda de morangos!"
    : `Meta: alcançar ${config.winMoney} moedas`;
  elements.goalStatus.classList.toggle("goal--won", hasWon);

  elements.buySeedButton.disabled = state.money < config.crop.seedPrice;
  elements.sellButton.disabled = state.strawberries <= 0;

  renderFarmGrid();
}

function renderFarmGrid() {
  if (plotElements.length !== state.plots.length) {
    createFarmGrid();
  }

  state.plots.forEach((plot, index) => {
    const plotElement = plotElements[index];

    if (!plotElement) {
      return;
    }

    plotElement.button.className = `plot plot--${plot.state}`;
    plotElement.button.setAttribute("aria-label", getPlotLabel(plot, index));
    plotElement.emoji.textContent = getPlotEmoji(plot);
    plotElement.name.textContent = getPlotName(plot);
    plotElement.timer.textContent = getPlotTimerText(plot);
  });
}

function createFarmGrid() {
  elements.farmGrid.innerHTML = "";
  plotElements.length = 0;

  state.plots.forEach((_, index) => {
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

    plotButton.append(emoji, name, timer);
    elements.farmGrid.append(plotButton);
    plotElements.push({
      button: plotButton,
      emoji,
      name,
      timer,
    });
  });
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
    return "Colher";
  }

  return "Terreno vazio";
}

function getPlotTimerText(plot) {
  if (plot.state === config.plotStates.growing && Number.isFinite(plot.readyAt)) {
    const remainingMs = Math.max(0, plot.readyAt - Date.now());
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    return `Faltam ${remainingSeconds}s`;
  }

  if (plot.state === config.plotStates.ready) {
    return "Clique para colher";
  }

  return "Clique para plantar";
}

function getPlotLabel(plot, index) {
  return `Canteiro ${index + 1}: ${getPlotName(plot)}. ${getPlotTimerText(plot)}`;
}

window.addEventListener("beforeunload", () => {
  if (tickIntervalId !== null) {
    window.clearInterval(tickIntervalId);
  }
  saveState();
});
