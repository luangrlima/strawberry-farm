const path = require("path");
const fs = require("fs");
const { pathToFileURL, fileURLToPath } = require("url");
let chromium;

try {
  ({ chromium } = require("playwright"));
} catch (error) {
  console.error("Playwright não está disponível neste ambiente Node.");
  console.error("Instale a dependência ou execute o script em um ambiente com `playwright` já disponível.");
  process.exit(1);
}

const PROJECT_ROOT = resolveProjectRoot();
const TARGET_URL = process.env.TARGET_URL || pathToFileURL(path.resolve(PROJECT_ROOT, "public/index.html")).href;
const STORAGE_KEY = "strawberry-farm-save";
const FIXTURE_PATH = path.resolve(PROJECT_ROOT, "tests/fixtures/legacy-save-v1.json");
const ARTIFACTS_DIR = path.resolve(PROJECT_ROOT, "tests/artifacts");
const RUN_ID = createRunId();
const SUCCESS_SCREENSHOT_PATH = path.join(ARTIFACTS_DIR, `strawberry-farm-smoke-${RUN_ID}.png`);
const ERROR_SCREENSHOT_PATH = path.join(ARTIFACTS_DIR, `strawberry-farm-smoke-error-${RUN_ID}.png`);
const PLAYWRIGHT_HEADLESS = process.env.PW_HEADLESS !== "false";
const PLAYWRIGHT_SLOW_MO = Number(process.env.PW_SLOW_MO || 0);
const PLAYWRIGHT_ARGS = process.env.PW_ARGS
  ? process.env.PW_ARGS.split(/\s+/).filter(Boolean)
  : ["--no-sandbox", "--disable-dev-shm-usage"];

fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

function resolveProjectRoot() {
  if (process.env.PROJECT_ROOT) {
    return path.resolve(process.env.PROJECT_ROOT);
  }

  if (process.env.TARGET_URL && process.env.TARGET_URL.startsWith("file:")) {
    try {
      return path.dirname(fileURLToPath(process.env.TARGET_URL));
    } catch {
      return path.resolve(__dirname, "../..");
    }
  }

  return path.resolve(__dirname, "../..");
}

function createRunId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

  return `${year}${month}${day}-${hours}${minutes}${seconds}-${milliseconds}`;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function loadLegacyFixture() {
  return JSON.parse(fs.readFileSync(FIXTURE_PATH, "utf8"));
}

function materializeLegacySave(template, now) {
  const plots = Array.from({ length: 16 }, (_, index) => {
    const templatePlot = template.plots[index];

    if (!templatePlot) {
      return {
        id: index,
        state: "empty",
        plantedAt: null,
        readyAt: null,
        rottenAt: null,
        growthDurationMs: null,
      };
    }

    return {
      id: index,
      state: templatePlot.state,
      plantedAt: Number.isFinite(templatePlot.plantedOffsetMs) ? now + templatePlot.plantedOffsetMs : null,
      readyAt: Number.isFinite(templatePlot.readyInMs) ? now + templatePlot.readyInMs : null,
      rottenAt: Number.isFinite(templatePlot.rottenInMs) ? now + templatePlot.rottenInMs : null,
      growthDurationMs: Number.isFinite(templatePlot.growthDurationMs) ? templatePlot.growthDurationMs : null,
    };
  });

  return {
    money: template.money,
    seeds: template.seeds,
    strawberries: template.strawberries,
    unlockedPlotCount: template.unlockedPlotCount,
    hasExpandedFarm: template.hasExpandedFarm,
    upgrades: template.upgrades,
    progression: template.progression,
    ui: template.ui,
    stats: template.stats,
    prestige: template.prestige,
    activeEvent: {
      id: template.activeEvent.id,
      durationMs: template.activeEvent.durationMs,
      endsAt: now + template.activeEvent.endsInMs,
    },
    combo: {
      count: template.combo.count,
      lastHarvestAt: now + template.combo.lastHarvestOffsetMs,
      expiresAt: now + template.combo.expiresInMs,
      lastRewardedThreshold: template.combo.lastRewardedThreshold,
      rewardMoney: template.combo.rewardMoney,
    },
    market: {
      currentPrice: template.market.currentPrice,
      previousPrice: template.market.previousPrice,
      nextUpdateAt: now + template.market.nextUpdateInMs,
    },
    helper: {
      nextHarvestAt: now + template.helper.nextHarvestInMs,
      lastHarvestAt: now + template.helper.lastHarvestOffsetMs,
      lastPlotId: template.helper.lastPlotId,
      lastActionAt: now + template.helper.lastActionOffsetMs,
      lastActionText: template.helper.lastActionText,
    },
    plots,
    message: "Save legado carregado."
  };
}

async function textOf(page, selector) {
  return (await page.locator(selector).textContent())?.trim() || "";
}

async function numberOf(page, selector) {
  return Number(await textOf(page, selector));
}

async function unlockedPlotCount(page) {
  return page.locator(".plot:not([disabled])").count();
}

async function plotVisualState(page, index = 0) {
  return page.locator(".plot__visual").nth(index).evaluate((element) => ({
    ground: element.dataset.ground,
    tilled: element.dataset.tilled,
    crop: element.dataset.crop,
    overlay: element.dataset.overlay,
    progress: element.dataset.progress,
  }));
}

async function waitForText(page, selector, expected, timeout = 5000) {
  await page.waitForFunction(
    ({ targetSelector, expectedText }) => {
      const element = document.querySelector(targetSelector);
      return element && element.textContent && element.textContent.includes(expectedText);
    },
    { targetSelector: selector, expectedText: expected },
    { timeout },
  );
}

async function clearSave(page) {
  await page.evaluate((storageKey) => window.localStorage.removeItem(storageKey), STORAGE_KEY);
}

async function disableRandomEvents(page) {
  await page.evaluate(() => {
    window.__strawberryFarmDebug.setRandomEventsEnabled(false);
  });
}

async function injectLegacySave(page) {
  const serializedSave = JSON.stringify(materializeLegacySave(loadLegacyFixture(), Date.now()));

  await page.evaluate(
    ({ storageKey, serialized }) => {
      window.localStorage.setItem(storageKey, serialized);
    },
    { storageKey: STORAGE_KEY, serialized: serializedSave },
  );
}

async function setExpiredComboScenario(page) {
  await page.evaluate(() => {
    const state = window.__strawberryFarmDebug.getState();
    state.money = 20;
    state.seeds = 0;
    state.strawberries = 0;
    state.systems.combo = {
      count: 2,
      lastHarvestAt: Date.now() - 1000,
      expiresAt: Date.now() - 1,
      lastRewardedThreshold: 0,
      rewardMoney: 0,
    };
    state.plots = state.plots.map((plot, index) => ({
      ...plot,
      id: index,
        state: index === 0 ? "ready" : "empty",
        plantedAt: null,
        readyAt: null,
        rottenAt: index === 0 ? Date.now() + 4000 : null,
        growthDurationMs: null,
      }));
    window.__strawberryFarmDebug.setState(state);
  });
}

(async () => {
  const browser = await chromium.launch({
    headless: PLAYWRIGHT_HEADLESS,
    slowMo: PLAYWRIGHT_SLOW_MO,
    args: PLAYWRIGHT_ARGS,
  });
  const page = await browser.newPage({ viewport: { width: 1366, height: 860 } });

  try {
    await page.goto(TARGET_URL, { waitUntil: "load" });
    await clearSave(page);
    await page.reload({ waitUntil: "load" });
    await disableRandomEvents(page);

    console.log("Smoke 1: HUD inicial");
    await waitForText(page, "h1", "Fazenda de Morangos");
    assert((await page.locator(".plot").count()) === 16, "A grade da fazenda deveria manter 16 slots.");
    assert((await unlockedPlotCount(page)) === 6, "A fazenda inicial deveria liberar 6 canteiros.");
    assert((await textOf(page, "#marketPriceValue")) === "3 moedas", "O preço inicial deveria ser 3 moedas.");
    assert((await textOf(page, "#helperStatusValue")) === "Off", "O helper deveria iniciar desligado.");
    const initialPlot = await plotVisualState(page, 0);
    assert(initialPlot.crop === "none", "O primeiro canteiro deveria iniciar sem planta.");
    assert(initialPlot.tilled === "idle-soil", "O primeiro canteiro deveria iniciar com solo leve.");

    console.log("Smoke 2: plantio e reload");
    await page.locator(".plot").nth(0).click();
    await waitForText(page, "#statusMessage", "Plantado.");
    const plantedPlot = await plotVisualState(page, 0);
    assert(plantedPlot.crop === "strawberry-growing-1", "O plantio deveria ativar o sprite inicial de crescimento.");
    assert(plantedPlot.progress === "grow-ring", "O canteiro em crescimento deveria expor o progresso embutido.");
    await page.reload({ waitUntil: "load" });
    await disableRandomEvents(page);
    await page.waitForFunction(() => {
      const plot = document.querySelector(".plot");
      return plot && plot.textContent && plot.textContent.includes("Crescendo");
    });
    assert(
      (await plotVisualState(page, 0)).crop?.startsWith("strawberry-growing-"),
      "O sprite de crescimento deveria persistir apos reload.",
    );

    console.log("Smoke 3: borda de combo expirada");
    await setExpiredComboScenario(page);
    await page.locator(".plot").nth(0).click();
    await waitForText(page, "#statusMessage", "Colheita.");
    assert(!(await textOf(page, "#statusMessage")).includes("Combo x"), "Combo expirado não deveria continuar ativo.");

    console.log("Smoke 4: apodrecimento e limpeza");
    await page.evaluate(() => {
      const state = window.__strawberryFarmDebug.getState();
      state.plots = state.plots.map((plot, index) => ({
        ...plot,
        id: index,
        state: index === 0 ? "ready" : "empty",
        plantedAt: null,
        readyAt: null,
        rottenAt: index === 0 ? Date.now() + 300 : null,
        growthDurationMs: null,
      }));
      window.__strawberryFarmDebug.setState(state);
    });
    await page.waitForFunction(() => {
      const plot = document.querySelector(".plot");
      return plot && plot.textContent && plot.textContent.includes("Estragado");
    }, { timeout: 4000 });
    const rottenPlot = await plotVisualState(page, 0);
    assert(rottenPlot.crop === "strawberry-rotten", "O sprite deveria refletir o estado estragado.");
    assert(rottenPlot.overlay === "rotten-flies", "O estado estragado deveria ativar o overlay diegético.");
    await page.locator(".plot").nth(0).click();
    await waitForText(page, "#statusMessage", "estragados removidos");
    await page.waitForFunction(() => {
      const plot = document.querySelector(".plot");
      return plot && plot.textContent && plot.textContent.includes("Terreno vazio");
    });
    assert((await plotVisualState(page, 0)).crop === "none", "A limpeza deveria restaurar o tile vazio.");

    console.log("Smoke 5: save legado e timer edge");
    await injectLegacySave(page);
    await page.reload({ waitUntil: "load" });
    await waitForText(page, "#eventTitle", "Feira local");
    assert((await textOf(page, "#helperStatusValue")) === "On", "O helper legado deveria carregar ligado.");
    assert(!(await page.locator("#focusStrip").isHidden()), "O combo legado deveria permanecer visível após load.");
    const berriesBeforeHelper = await numberOf(page, "#berryCount");
    await page.waitForFunction(
      (currentBerries) => Number(document.querySelector("#berryCount")?.textContent || "0") >= currentBerries + 1,
      berriesBeforeHelper,
      { timeout: 5000 },
    );

    console.log("Smoke 6: prestígio e reset");
    await page.evaluate(() => {
      const state = window.__strawberryFarmDebug.getState();
      state.money = 120;
      window.__strawberryFarmDebug.setState(state);
    });
    await page.waitForFunction(() => {
      const button = document.querySelector("#prestigeButton");
      return button && !button.disabled;
    });
    page.once("dialog", (dialog) => {
      dialog.accept().catch(() => {});
    });
    await page.click("#prestigeButton");
    await waitForText(page, "#prestigeLevelValue", "Nível 1");
    page.once("dialog", (dialog) => {
      dialog.accept().catch(() => {});
    });
    await page.click("#resetButton");
    await waitForText(page, "#prestigeLevelValue", "Nível 0");
    assert((await textOf(page, "#plotCountValue")) === "6/16", "O reset deveria restaurar a fazenda base.");

    await page.screenshot({
      path: SUCCESS_SCREENSHOT_PATH,
      fullPage: true,
    });
    console.log(`✅ Smoke passou. Screenshot salva em ${SUCCESS_SCREENSHOT_PATH}`);
  } catch (error) {
    console.error("❌ Falha no smoke:", error.message);
    await page
      .screenshot({
        path: ERROR_SCREENSHOT_PATH,
        fullPage: true,
      })
      .catch(() => {});
    console.error(`📸 Screenshot de erro salva em ${ERROR_SCREENSHOT_PATH}`);
    throw error;
  } finally {
    await browser.close();
  }
})();
