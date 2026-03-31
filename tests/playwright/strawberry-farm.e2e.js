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
const ARTIFACTS_DIR = path.resolve(PROJECT_ROOT, "tests/artifacts");
const RUN_ID = createRunId();
const SUCCESS_SCREENSHOT_PATH = path.join(ARTIFACTS_DIR, `strawberry-farm-test-${RUN_ID}.png`);
const ERROR_SCREENSHOT_PATH = path.join(ARTIFACTS_DIR, `strawberry-farm-test-error-${RUN_ID}.png`);
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

async function textOf(page, selector) {
  return (await page.locator(selector).textContent())?.trim() || "";
}

async function numberOf(page, selector) {
  return Number(await textOf(page, selector));
}

async function waitForText(page, selector, expected, timeout = 30000) {
  await page.waitForFunction(
    ({ targetSelector, expectedText }) => {
      const element = document.querySelector(targetSelector);
      return element && element.textContent && element.textContent.includes(expectedText);
    },
    { targetSelector: selector, expectedText: expected },
    { timeout },
  );
}

async function disableRandomEvents(page) {
  await page.evaluate(() => {
    window.__strawberryFarmDebug.setRandomEventsEnabled(false);
  });
}

async function forceEvent(page, eventId, durationMs) {
  await page.evaluate(
    ({ id, duration }) => {
      window.__strawberryFarmDebug.forceEvent(id, duration);
    },
    { id: eventId, duration: durationMs },
  );
}

async function clearEvent(page) {
  await page.evaluate(() => {
    window.__strawberryFarmDebug.clearEvent();
  });
}

async function openUpgradesTab(page) {
  await page.click("#sidebarUpgradesTab");
  await page.waitForFunction(() => {
    const upgradesTab = document.querySelector("#sidebarUpgradesTab");
    const upgradesPanel = document.querySelector("#upgradesPanel");
    return (
      upgradesTab &&
      upgradesTab.getAttribute("aria-selected") === "true" &&
      upgradesPanel &&
      !upgradesPanel.hidden
    );
  });
}

async function installLegacySaveFixture(page) {
  await page.evaluate((storageKey) => {
    const currentState = window.__strawberryFarmDebug.getState();
    const now = Date.now();
    const growthDurationMs = 4000;
    currentState.money = 17;
    currentState.seeds = 1;
    currentState.strawberries = 2;
    currentState.ui.helpOpen = true;
    currentState.systems.activeEvent = {
      id: "market-day",
      endsAt: now + 4000,
      durationMs: 4000,
    };
    currentState.systems.combo = {
      count: 2,
      lastHarvestAt: now,
      expiresAt: now + 4000,
      lastRewardedThreshold: 0,
      rewardMoney: 0,
    };
    currentState.systems.market = {
      currentPrice: 5,
      previousPrice: 4,
      direction: "up",
      nextUpdateAt: now + 6000,
    };
    currentState.upgrades.helper = true;
    currentState.upgrades.helperPlanting = false;
    currentState.systems.helper = {
      nextHarvestAt: now + 4000,
      lastHarvestAt: null,
      lastPlotId: null,
      lastActionAt: now,
      lastActionText: "Helper ativado.",
    };
    currentState.plots = currentState.plots.map((plot, index) => ({
      ...plot,
      id: index,
      state: index === 0 ? "growing" : "empty",
      plantedAt: index === 0 ? now : null,
      readyAt: index === 0 ? now + growthDurationMs : null,
      rottenAt: null,
      growthDurationMs: index === 0 ? growthDurationMs : null,
    }));
    delete currentState.saveVersion;
    window.localStorage.setItem(storageKey, JSON.stringify(currentState));
  }, STORAGE_KEY);
}

async function setMarketState(page, { currentPrice, previousPrice = currentPrice, nextUpdateInMs = 12000, forcedSteps = [] }) {
  await page.evaluate(
    ({ nextPrice, lastPrice, nextUpdateMs, steps }) => {
      const currentState = window.__strawberryFarmDebug.getState();
      currentState.systems.market.currentPrice = nextPrice;
      currentState.systems.market.previousPrice = lastPrice;
      currentState.systems.market.direction =
        nextPrice > lastPrice ? "up" : nextPrice < lastPrice ? "down" : "steady";
      currentState.systems.market.nextUpdateAt = Date.now() + nextUpdateMs;
      window.__strawberryFarmDebug.setForcedMarketSteps(steps);
      window.__strawberryFarmDebug.setState(currentState);
    },
    { nextPrice: currentPrice, lastPrice: previousPrice, nextUpdateMs: nextUpdateInMs, steps: forcedSteps },
  );
}

async function extendComboWindow(page, durationMs) {
  await page.evaluate((duration) => {
    const currentState = window.__strawberryFarmDebug.getState();

    if (currentState.systems?.combo) {
      currentState.systems.combo.expiresAt = Date.now() + duration;
      currentState.systems.combo.lastHarvestAt = Date.now();
      window.__strawberryFarmDebug.setState(currentState);
    }
  }, durationMs);
}

async function resetComboState(page) {
  await page.evaluate(() => {
    const currentState = window.__strawberryFarmDebug.getState();
    currentState.systems.combo = {
      count: 0,
      lastHarvestAt: null,
      expiresAt: null,
      lastRewardedThreshold: 0,
      rewardMoney: 0,
    };
    window.__strawberryFarmDebug.setState(currentState);
  });

  await page.waitForFunction(() => {
    const comboStrip = document.querySelector("#comboStrip");
    return !comboStrip || comboStrip.hidden;
  });
}

async function resetHelperUpgradeState(page) {
  await page.evaluate(() => {
    const currentState = window.__strawberryFarmDebug.getState();
    currentState.upgrades.helper = false;
    currentState.upgrades.helperPlanting = false;
    currentState.systems.helper = {
      nextHarvestAt: null,
      lastHarvestAt: null,
      lastPlotId: null,
      lastActionAt: null,
      lastActionText: "",
    };
    window.__strawberryFarmDebug.setState(currentState);
  });

  await page.waitForFunction(() => {
    const button = document.querySelector("#helperButton");
    const status = document.querySelector("#helperStatusValue");
    return (
      button &&
      button.textContent &&
      button.textContent.includes("Comprar") &&
      status &&
      status.textContent === "Off"
    );
  });
}

async function setHelperNextHarvestIn(page, durationMs) {
  await page.evaluate((duration) => {
    const currentState = window.__strawberryFarmDebug.getState();
    currentState.systems.helper.nextHarvestAt = Date.now() + duration;
    window.__strawberryFarmDebug.setState(currentState);
  }, durationMs);
}

async function preparePrestigeAvailability(page, targetMoney) {
  await page.evaluate((moneyTarget) => {
    const currentState = window.__strawberryFarmDebug.getState();
    currentState.money = moneyTarget;
    window.__strawberryFarmDebug.setState(currentState);
  }, targetMoney);

  await page.waitForFunction(
    (moneyTarget) => {
      const money = Number(document.querySelector("#moneyCount")?.textContent || "0");
      const button = document.querySelector("#prestigeButton");
      return money >= moneyTarget && button && !button.disabled;
    },
    targetMoney,
    { timeout: 5000 },
  );
}

async function preparePostPrestigeProgression(page) {
  await page.evaluate(() => {
    const currentState = window.__strawberryFarmDebug.getState();
    currentState.money = 80;
    currentState.seeds = 3;
    currentState.strawberries = 0;
    currentState.hasExpandedFarm = false;
    currentState.unlockedPlotCount = 9;
    currentState.stats.harvestedTotal = 51;
    currentState.stats.upgradesPurchased = 3;
    currentState.stats.soldTotal = 20;
    currentState.progression.completedGoalIds = ["harvest-3", "sell-20", "harvest-50", "prestige-1", "buy-upgrade", "reach-35"];
    currentState.upgrades.fertilizer = 0;
    currentState.upgrades.market = 0;
    currentState.upgrades.helper = false;
    currentState.upgrades.helperPlanting = false;
    currentState.systems.helper = {
      nextHarvestAt: null,
      lastHarvestAt: null,
      lastPlotId: null,
      lastActionAt: null,
      lastActionText: "",
    };
    currentState.plots = currentState.plots.map((plot, index) => ({
      ...plot,
      id: index,
      state: "empty",
      plantedAt: null,
      readyAt: null,
      rottenAt: null,
      growthDurationMs: null,
    }));
    window.__strawberryFarmDebug.setState(currentState);
  });

  await page.waitForFunction(() => {
    const money = Number(document.querySelector("#moneyCount")?.textContent || "0");
    const completed = document.querySelector("#progressSummary")?.textContent || "";
    return money === 80 && completed.includes("6/8");
  }, { timeout: 5000 });
}

async function getComboSnapshot(page) {
  return page.evaluate(() => {
    const currentState = window.__strawberryFarmDebug.getState();
    return currentState.systems.combo;
  });
}

async function buySeedsUntilFull(page) {
  while (!(await page.locator("#buySeedButton").isDisabled())) {
    await page.click("#buySeedButton");
  }
}

async function ensureAtLeastOneSeed(page) {
  if ((await numberOf(page, "#seedCount")) <= 0 && !(await page.locator("#buySeedButton").isDisabled())) {
    await page.click("#buySeedButton");
  }
}

async function plantAllAvailableSeeds(page) {
  const plotCount = await page.locator(".plot").count();

  for (let index = 0; index < plotCount; index += 1) {
    if ((await numberOf(page, "#seedCount")) <= 0) {
      break;
    }

    const plot = page.locator(".plot").nth(index);
    const label = await plot.getAttribute("aria-label");

    if (label && label.includes("Terreno vazio")) {
      await plot.click();
    }
  }
}

async function waitForAnyReadyPlot(page, timeout = 15000) {
  await page.waitForFunction(() => {
    const plots = Array.from(document.querySelectorAll(".plot"));
    return plots.some((plot) => plot.textContent && plot.textContent.includes("Pronto para colher"));
  }, { timeout });
}

async function waitForAllGrowingPlots(page, timeout = 15000) {
  await page.waitForFunction(() => {
    const plots = Array.from(document.querySelectorAll(".plot"));
    return plots.every((plot) => !plot.textContent.includes("Crescendo"));
  }, { timeout });
}

async function harvestAllReadyPlots(page) {
  const plotCount = await page.locator(".plot").count();

  for (let index = 0; index < plotCount; index += 1) {
    const plot = page.locator(".plot").nth(index);
    const label = await plot.getAttribute("aria-label");

    if (label && label.includes("colher")) {
      await plot.click();
    }
  }
}

async function reachMoneyTarget(page, target) {
  while ((await numberOf(page, "#moneyCount")) < target) {
    await buySeedsUntilFull(page);
    await plantAllAvailableSeeds(page);

    const growingPlots = await page
      .locator(".plot")
      .evaluateAll((plots) => plots.filter((plot) => plot.textContent.includes("Crescendo")).length);

    assert(growingPlots > 0, `Nenhum canteiro entrou em crescimento ao tentar alcançar ${target} moedas.`);

    await waitForAllGrowingPlots(page);
    await harvestAllReadyPlots(page);

    if (!(await page.locator("#sellButton").isDisabled())) {
      await page.click("#sellButton");
    }
  }
}

(async () => {
  const browser = await chromium.launch({
    headless: PLAYWRIGHT_HEADLESS,
    slowMo: PLAYWRIGHT_SLOW_MO,
    args: PLAYWRIGHT_ARGS,
  });
  const page = await browser.newPage({ viewport: { width: 1366, height: 860 } });

  try {
    page.on("console", (message) => {
      if (message.type() === "error") {
        console.log("Console error:", message.text());
      }
    });

    page.on("pageerror", (error) => {
      console.log("Page error:", error.message);
    });

    console.log("Abrindo jogo em:", TARGET_URL);
    await page.goto(TARGET_URL, { waitUntil: "load" });

    await page.evaluate((storageKey) => window.localStorage.removeItem(storageKey), STORAGE_KEY);
    await page.reload({ waitUntil: "load" });
    await disableRandomEvents(page);

    console.log("Cenário 1: renderização inicial e HUD");
    await waitForText(page, "h1", "Fazenda de Morangos");
    assert((await page.locator(".plot").count()) === 9, "A fazenda deveria iniciar em 3x3.");
    assert((await textOf(page, "#plotCountValue")) === "9/16", "HUD inicial da fazenda incorreto.");
    assert((await textOf(page, "#sellPriceValue")) === "3 moedas", "Preço de venda inicial incorreto.");
    assert((await textOf(page, "#growthTimeValue")) === "10s", "Tempo de crescimento inicial incorreto.");
    assert((await textOf(page, "#helperStatusValue")) === "Off", "O helper deveria iniciar desligado.");
    assert((await textOf(page, "#prestigeLevelValue")) === "Nível 0", "O prestígio deveria iniciar no nível 0.");
    assert((await textOf(page, "#prestigeBonusHint")).includes("+0%"), "O bônus inicial de prestígio deveria ser 0%.");
    assert((await textOf(page, "#progressSummary")) === "0/8 metas", "Resumo inicial de metas incorreto.");
    assert((await textOf(page, "#eventTitle")) === "Sem evento", "O banner de evento deveria iniciar vazio.");
    assert((await textOf(page, "#marketHeadline")).includes("Preço estável"), "O banner de mercado deveria iniciar estável.");
    assert(await page.locator("#helpPanel").isHidden(), "O painel de ajuda deveria iniciar recolhido.");
    const desktopLayoutCheck = await page.evaluate(() => {
      const viewportHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const goal = document.querySelector("#goalStatus")?.getBoundingClientRect();
      const buySeed = document.querySelector("#buySeedButton")?.getBoundingClientRect();
      const farm = document.querySelector("#farmGrid")?.getBoundingClientRect();
      const market = document.querySelector("#marketBanner")?.getBoundingClientRect();

      return {
        docHeight,
        viewportHeight,
        goalBottom: goal?.bottom || 0,
        buySeedBottom: buySeed?.bottom || 0,
        farmTop: farm?.top || 0,
        farmBottom: farm?.bottom || 0,
        marketBottom: market?.bottom || 0,
      };
    });
    assert(
      desktopLayoutCheck.docHeight <= desktopLayoutCheck.viewportHeight + 40,
      "A tela desktop ainda está exigindo scroll vertical demais.",
    );
    assert(desktopLayoutCheck.goalBottom < desktopLayoutCheck.viewportHeight, "A meta principal saiu da área visível.");
    assert(desktopLayoutCheck.buySeedBottom < desktopLayoutCheck.viewportHeight, "As ações principais saíram da área visível.");
    assert(desktopLayoutCheck.farmTop < desktopLayoutCheck.viewportHeight * 0.45, "A fazenda não ficou visualmente central o bastante.");
    assert(desktopLayoutCheck.farmBottom < desktopLayoutCheck.viewportHeight, "A fazenda inicial não coube acima da dobra.");
    assert(desktopLayoutCheck.marketBottom < desktopLayoutCheck.viewportHeight, "A coluna de apoio ainda está longa demais no desktop.");

    console.log("Cenário 1.1: ajuda rápida persistente");
    await page.click("#helpToggleButton");
    assert(!(await page.locator("#helpPanel").isHidden()), "O botão de ajuda não abriu o painel.");
    await page.click("#helpDismissButton");
    assert(await page.locator("#helpPanel").isHidden(), "O painel de ajuda não foi ocultado.");
    await page.reload({ waitUntil: "load" });
    await disableRandomEvents(page);
    assert(await page.locator("#helpPanel").isHidden(), "O estado do painel de ajuda não persistiu após reload.");

    console.log("Cenário 1.2: mercado dinâmico e clareza de preço");
    await setMarketState(page, { currentPrice: 4, previousPrice: 3, nextUpdateInMs: 700, forcedSteps: [1] });
    assert((await textOf(page, "#sellPriceValue")) === "4 moedas", "O preço final deveria refletir o mercado atual.");
    assert((await textOf(page, "#marketChangeIndicator")).includes("+1"), "O indicador de mercado deveria mostrar a alta.");
    await waitForText(page, "#marketPriceValue", "5 moedas", 4000);
    assert((await textOf(page, "#marketHeadline")).includes("alta"), "O banner deveria sinalizar mercado em alta.");
    assert((await textOf(page, "#marketSummary")).includes("Bom momento"), "A UI deveria orientar o jogador quando o preço estiver no topo.");
    await setMarketState(page, { currentPrice: 5, previousPrice: 4, nextUpdateInMs: 30000 });

    console.log("Cenário 2: plantio e save/load base");
    const firstPlot = page.locator(".plot").nth(0);
    await firstPlot.click();
    await waitForText(page, "#statusMessage", "Plantado.");
    await page.reload({ waitUntil: "load" });
    await disableRandomEvents(page);
    await page.waitForFunction(() => {
      const plot = document.querySelector(".plot");
      return plot && plot.textContent && plot.textContent.includes("Crescendo");
    });
    assert((await textOf(page, "#plotCountValue")) === "9/16", "O save/load corrompeu o tamanho base da fazenda.");
    assert((await textOf(page, "#marketPriceValue")) === "5 moedas", "O preço de mercado não persistiu após reload.");

    console.log("Cenário 2.1: save legado sem versão");
    await installLegacySaveFixture(page);
    await page.reload({ waitUntil: "load" });
    await disableRandomEvents(page);
    await waitForText(page, "#eventTitle", "Feira local");
    assert((await textOf(page, "#moneyCount")) === "17", "O save legado sem versão não restaurou o dinheiro.");
    assert((await textOf(page, "#seedCount")) === "1", "O save legado sem versão não restaurou as sementes.");
    assert((await textOf(page, "#sellPriceValue")) === "5 moedas", "O mercado do save legado não foi hidratado.");
    assert((await textOf(page, "#buySeedButton")) === "Semente (1)", "O evento ativo do save legado não foi hidratado.");
    assert((await textOf(page, "#helperStatusValue")) === "On", "O helper do save legado não foi hidratado.");
    assert(!(await page.locator("#comboStrip").isHidden()), "O combo ativo do save legado não foi hidratado.");
    assert(!(await page.locator("#helpPanel").isHidden()), "O help panel do save legado não foi hidratado.");

    console.log("Cenário 2.2: combo de colheita e persistência curta");
    await page.evaluate(() => {
      const currentState = window.__strawberryFarmDebug.getState();
      window.StrawberryFarm.config.combo.windowMs = 5000;
      currentState.seeds = 0;
      currentState.strawberries = 0;
      currentState.systems.combo = {
        count: 0,
        lastHarvestAt: null,
        expiresAt: null,
        lastRewardedThreshold: 0,
        rewardMoney: 0,
      };
      currentState.plots = currentState.plots.map((plot, index) => ({
        ...plot,
        id: index,
        state: index < 3 ? "ready" : "empty",
        plantedAt: null,
        readyAt: null,
        rottenAt: index < 3 ? Date.now() + 5000 : null,
        growthDurationMs: null,
      }));
      window.__strawberryFarmDebug.setState(currentState);
    });
    const moneyBeforeCombo = await numberOf(page, "#moneyCount");
    await harvestAllReadyPlots(page);
    await page.waitForFunction(() => {
      const title = document.querySelector("#comboTitle")?.textContent || "";
      const match = title.match(/Combo x(\d+)/);
      return match && Number(match[1]) >= 3;
    });
    assert(!(await page.locator("#comboStrip").isHidden()), "O combo ativo deveria aparecer na interface.");
    assert(
      (await numberOf(page, "#moneyCount")) >= moneyBeforeCombo + 1,
      "O combo de colheita não concedeu a moeda bônus esperada.",
    );
    await extendComboWindow(page, 5000);
    await page.reload({ waitUntil: "load" });
    await disableRandomEvents(page);
    assert(!(await page.locator("#comboStrip").isHidden()), "O estado do combo ativo não persistiu após reload.");

    console.log("Cenário 2.3: morango estraga e exige limpeza manual");
    await page.evaluate(() => {
      const currentState = window.__strawberryFarmDebug.getState();
      currentState.plots = currentState.plots.map((plot, index) => ({
        ...plot,
        id: index,
        state: index === 0 ? "ready" : "empty",
        plantedAt: null,
        readyAt: null,
        rottenAt: index === 0 ? Date.now() + 400 : null,
        growthDurationMs: null,
      }));
      currentState.seeds = Math.max(1, currentState.seeds);
      currentState.strawberries = 0;
      window.__strawberryFarmDebug.setState(currentState);
    });
    await page.waitForFunction(() => {
      const plot = document.querySelector(".plot");
      return plot && plot.textContent && plot.textContent.includes("Estragado");
    }, { timeout: 4000 });
    assert(
      (await page.locator(".plot").nth(0).getAttribute("aria-label"))?.includes("Clique para limpar"),
      "O canteiro estragado deveria instruir a limpeza manual.",
    );
    const berriesBeforeRottenClear = await numberOf(page, "#berryCount");
    await page.locator(".plot").nth(0).click();
    await waitForText(page, "#statusMessage", "estragados removidos");
    assert(
      (await numberOf(page, "#berryCount")) === berriesBeforeRottenClear,
      "Limpar o morango estragado não deveria conceder morangos.",
    );
    await page.locator(".plot").nth(0).click();
    await waitForText(page, "#statusMessage", "Plantado.");
    await page.waitForFunction(() => {
      const plot = document.querySelector(".plot");
      return plot && plot.textContent && plot.textContent.includes("Crescendo");
    });

    console.log("Cenário 3: expansão da fazenda para 4x4");
    await reachMoneyTarget(page, 10);
    await openUpgradesTab(page);
    await page.click("#expandFarmButton");
    await page.waitForFunction(() => {
      const expansionButton = document.querySelector("#expandFarmButton");
      const plotCount = document.querySelector("#plotCountValue");
      return (
        expansionButton &&
        expansionButton.textContent &&
        expansionButton.textContent.includes("4x4 ativa") &&
        plotCount &&
        plotCount.textContent === "16/16"
      );
    });
    assert((await page.locator(".plot").count()) === 16, "A expansão não liberou 16 canteiros.");
    assert((await textOf(page, "#plotCountValue")) === "16/16", "HUD não refletiu a fazenda expandida.");
    assert(!(await page.locator("#milestoneToast").isHidden()), "A conclusão de meta deveria exibir feedback visual.");
    await page.reload({ waitUntil: "load" });
    await disableRandomEvents(page);
    assert((await page.locator(".plot").count()) === 16, "A expansão não persistiu após reload.");

    console.log("Cenário 4: evento Feira local e economia de sementes");
    await forceEvent(page, "market-day", 5000);
    await waitForText(page, "#eventTitle", "Feira local");
    assert((await textOf(page, "#buySeedButton")) === "Semente (1)", "A Feira local não reduziu o preço da semente.");
    assert((await textOf(page, "#eventEffect")).includes("Semente por 1"), "O efeito textual da Feira local não ficou claro.");
    assert(
      (await textOf(page, "#eventBanner")).includes("Afeta compra de sementes"),
      "O banner do evento deveria destacar a ação afetada.",
    );
    const moneyBeforeDiscountSeed = await numberOf(page, "#moneyCount");
    await page.click("#buySeedButton");
    assert(
      (await numberOf(page, "#moneyCount")) === moneyBeforeDiscountSeed - 1,
      "A compra de semente durante a Feira local não descontou 1 moeda.",
    );
    await page.reload({ waitUntil: "load" });
    await disableRandomEvents(page);
    await waitForText(page, "#eventTitle", "Feira local");
    assert((await textOf(page, "#buySeedButton")) === "Semente (1)", "O evento ativo não persistiu após reload.");
    await page.waitForFunction(() => {
      const title = document.querySelector("#eventTitle");
      return title && title.textContent === "Sem evento";
    }, { timeout: 8000 });
    assert((await textOf(page, "#buySeedButton")) === "Semente (2)", "O preço da semente não voltou ao normal após o evento.");

    console.log("Cenário 5: upgrade de crescimento e timing da chuva");
    await reachMoneyTarget(page, 10);
    await openUpgradesTab(page);
    await page.click("#fertilizerButton");
    await page.waitForFunction(() => {
      const button = document.querySelector("#fertilizerButton");
      const timeValue = document.querySelector("#growthTimeValue");
      const meta = document.querySelector("#fertilizerLevelMeta");
      return button && button.textContent.includes("Nível 2") && timeValue.textContent === "8s" && meta && meta.textContent.includes("1/3");
    });
    assert(
      (await textOf(page, "#fertilizerDescription")).includes("Tempo atual 8s"),
      "O card do adubo deveria mostrar o tempo atual apos o primeiro nivel.",
    );
    await forceEvent(page, "drizzle", 4000);
    await waitForText(page, "#eventTitle", "Chuva leve");
    assert((await textOf(page, "#growthTimeValue")) === "6s", "A Chuva leve não acelerou o tempo junto com o adubo.");
    assert(
      (await textOf(page, "#eventEffect")).includes("6s"),
      "O efeito textual da Chuva leve não refletiu o novo tempo.",
    );
    assert(
      (await textOf(page, "#eventBanner")).includes("Afeta crescimento"),
      "O banner da Chuva leve deveria explicar o impacto no crescimento.",
    );
    await ensureAtLeastOneSeed(page);
    await page.locator(".plot").nth(0).click();
    await page.waitForFunction(() => {
      const plot = document.querySelector(".plot");
      return plot && plot.textContent && (plot.textContent.includes("Faltam 6s") || plot.textContent.includes("Faltam 5s"));
    });
    await page.reload({ waitUntil: "load" });
    await disableRandomEvents(page);
    await waitForText(page, "#eventTitle", "Chuva leve");
    assert((await textOf(page, "#growthTimeValue")) === "6s", "O efeito da Chuva leve não persistiu após reload.");
    await page.waitForFunction(() => {
      const title = document.querySelector("#eventTitle");
      const growth = document.querySelector("#growthTimeValue");
      return title && title.textContent === "Sem evento" && growth && growth.textContent === "8s";
    }, { timeout: 9000 });
    await reachMoneyTarget(page, 18);
    await openUpgradesTab(page);
    await page.click("#fertilizerButton");
    await page.waitForFunction(() => {
      const button = document.querySelector("#fertilizerButton");
      const timeValue = document.querySelector("#growthTimeValue");
      const meta = document.querySelector("#fertilizerLevelMeta");
      return button && button.textContent.includes("Nível 3") && timeValue && timeValue.textContent === "6s" && meta && meta.textContent.includes("2/3");
    });
    assert(
      (await textOf(page, "#fertilizerDescription")).includes("Próximo nível"),
      "O card do adubo deveria indicar o proximo tier antes do nivel maximo.",
    );

    console.log("Cenário 6: upgrade de venda e economia do evento Sol forte");
    await reachMoneyTarget(page, 14);
    await openUpgradesTab(page);
    await page.click("#marketButton");
    await setMarketState(page, { currentPrice: 5, previousPrice: 4, nextUpdateInMs: 12000 });
    await page.waitForFunction(() => {
      const button = document.querySelector("#marketButton");
      const sellValue = document.querySelector("#sellPriceValue");
      const meta = document.querySelector("#marketLevelMeta");
      return button && button.textContent.includes("Nível 2") && sellValue.textContent === "7 moedas" && meta && meta.textContent.includes("1/3");
    });
    assert(
      (await textOf(page, "#marketDescription")).includes("Bônus atual +2"),
      "O card da caixa premium deveria mostrar o bonus atual apos o primeiro nivel.",
    );
    await reachMoneyTarget(page, 24);
    await openUpgradesTab(page);
    await page.click("#marketButton");
    await setMarketState(page, { currentPrice: 5, previousPrice: 4, nextUpdateInMs: 12000 });
    await page.waitForFunction(() => {
      const button = document.querySelector("#marketButton");
      const sellValue = document.querySelector("#sellPriceValue");
      const meta = document.querySelector("#marketLevelMeta");
      return button && button.textContent.includes("Nível 3") && sellValue && sellValue.textContent === "9 moedas" && meta && meta.textContent.includes("2/3");
    });
    await page.evaluate(() => {
      const currentState = window.__strawberryFarmDebug.getState();
      currentState.strawberries = 3;
      currentState.seeds = 0;
      currentState.plots = currentState.plots.map((plot, index) => ({
        ...plot,
        id: index,
        state: "empty",
        plantedAt: null,
        readyAt: null,
        growthDurationMs: null,
      }));
      window.__strawberryFarmDebug.setState(currentState);
    });
    assert(!(await page.locator("#sellButton").isDisabled()), "Era esperado ter morangos para vender antes do Sol forte.");
    await forceEvent(page, "sunshine", 5000);
    await waitForText(page, "#eventTitle", "Sol forte");
    assert((await textOf(page, "#sellPriceValue")) === "10 moedas", "O Sol forte não aumentou o preço de venda sobre o mercado atual.");
    assert(
      (await textOf(page, "#eventEffect")).includes("+1 por morango"),
      "O efeito textual do Sol forte não ficou claro.",
    );
    assert(
      (await textOf(page, "#eventBanner")).includes("Afeta vendas"),
      "O banner do Sol forte deveria destacar a venda como ação afetada.",
    );
    // Neutralize all goals with money rewards to prevent contamination during sellButton click.
    // Goals that grant money: harvest-3 (+4), buy-upgrade (+5), sell-20 (+6), harvest-50 (+8), all-upgrades (+12).
    await page.evaluate(() => {
      const currentState = window.__strawberryFarmDebug.getState();
      const goalsWithMoneyReward = ["harvest-3", "buy-upgrade", "sell-20", "harvest-50", "all-upgrades"];
      goalsWithMoneyReward.forEach((id) => {
        if (!currentState.progression.completedGoalIds.includes(id)) {
          currentState.progression.completedGoalIds.push(id);
        }
      });
      window.__strawberryFarmDebug.setState(currentState);
    });
    const moneyBeforeSunnySale = await numberOf(page, "#moneyCount");
    const berriesBeforeSunnySale = await numberOf(page, "#berryCount");
    await page.click("#sellButton");
    assert(
      (await numberOf(page, "#moneyCount")) === moneyBeforeSunnySale + berriesBeforeSunnySale * 10,
      "A venda durante o Sol forte não respeitou o cálculo de mercado + upgrade + evento.",
    );
    await clearEvent(page);
    assert((await textOf(page, "#eventTitle")) === "Sem evento", "O evento não foi limpo corretamente no modo de teste.");

    console.log("Cenário 7: Farm Helper, eventos e persistência");
    await resetHelperUpgradeState(page);
    await reachMoneyTarget(page, 18);
    await openUpgradesTab(page);
    await page.click("#helperButton");
    await page.waitForFunction(() => {
      const button = document.querySelector("#helperButton");
      const status = document.querySelector("#helperStatusValue");
      return button && button.textContent.includes("Ajudante ativo") && status && status.textContent === "On";
    });
    assert(!(await page.locator("#helperStrip").isHidden()), "A faixa do helper deveria aparecer quando ativo.");
    await resetComboState(page);
    const comboBeforeHelper = await getComboSnapshot(page);
    assert(comboBeforeHelper.count === 0, "O combo deveria estar zerado antes do helper colher.");

    await reachMoneyTarget(page, 22);
    await openUpgradesTab(page);
    await page.click("#helperPlantingButton");
    await page.waitForFunction(() => {
      const button = document.querySelector("#helperPlantingButton");
      return button && button.textContent.includes("ativo");
    });
    assert(
      (await textOf(page, "#helperPlantingDescription")).includes("usa 1 semente"),
      "A melhoria de plantio assistido deveria deixar claro o consumo de sementes.",
    );

    await clearEvent(page);
    await resetComboState(page);
    await page.evaluate(() => {
      const currentState = window.__strawberryFarmDebug.getState();
      currentState.seeds = 2;
      currentState.systems.helper.nextHarvestAt = Date.now() + 200;
      currentState.plots = currentState.plots.map((plot, index) => ({
        ...plot,
        id: index,
        state: index === 0 ? "ready" : "empty",
        plantedAt: null,
        readyAt: null,
        rottenAt: index === 0 ? Date.now() + 5000 : null,
        growthDurationMs: null,
      }));
      window.__strawberryFarmDebug.setState(currentState);
    });
    const berriesBeforeHelperHarvest = await numberOf(page, "#berryCount");
    await page.waitForFunction(
      (currentBerries) => Number(document.querySelector("#berryCount")?.textContent || "0") === currentBerries + 1,
      berriesBeforeHelperHarvest,
      { timeout: 5000 },
    );
    assert(
      (await textOf(page, "#helperStripText")).includes("colheu o canteiro"),
      "A UI do helper deveria notificar a colheita automática.",
    );
    const comboAfterHelper = await getComboSnapshot(page);
    assert(comboAfterHelper.count === 0, "O helper não deveria ativar combo automático.");

    await clearEvent(page);
    await resetComboState(page);
    await page.evaluate(() => {
      const currentState = window.__strawberryFarmDebug.getState();
      const growthDurationMs = 6000;
      currentState.seeds = 2;
      currentState.systems.helper.nextHarvestAt = Date.now() + 200;
      currentState.systems.combo = {
        count: 0,
        lastHarvestAt: null,
        expiresAt: null,
        lastRewardedThreshold: 0,
        rewardMoney: 0,
      };
      currentState.plots = currentState.plots.map((plot, index) => ({
        ...plot,
        id: index,
        state: index === 0 ? "empty" : "growing",
        plantedAt: index === 0 ? null : Date.now(),
        readyAt: index === 0 ? null : Date.now() + growthDurationMs,
        rottenAt: null,
        growthDurationMs: index === 0 ? null : growthDurationMs,
      }));
      window.__strawberryFarmDebug.setState(currentState);
    });
    await page.waitForFunction(() => Number(document.querySelector("#seedCount")?.textContent || "0") === 1, {
      timeout: 5000,
    });
    assert(
      (await page.locator(".plot").nth(0).getAttribute("aria-label"))?.includes("Crescendo"),
      "O helper deveria plantar automaticamente em um canteiro vazio quando nao ha colheita.",
    );
    assert(
      (await textOf(page, "#helperStripText")).includes("plantou no canteiro"),
      "A UI do helper deveria notificar o plantio automatico.",
    );
    const comboAfterHelperPlant = await getComboSnapshot(page);
    assert(comboAfterHelperPlant.count === 0, "O helper nao deveria ativar combo ao plantar.");

    await page.reload({ waitUntil: "load" });
    await disableRandomEvents(page);
    assert((await textOf(page, "#helperStatusValue")) === "On", "O estado do helper não persistiu após reload.");
    assert(!(await page.locator("#helperStrip").isHidden()), "A faixa do helper não persistiu após reload.");
    assert(
      (await textOf(page, "#helperPlantingButton")).includes("ativo"),
      "A melhoria de plantio assistido nao persistiu apos reload.",
    );

    await page.evaluate(() => {
      const currentState = window.__strawberryFarmDebug.getState();
      const growthDurationMs = 6000;
      currentState.seeds = 2;
      currentState.systems.helper.nextHarvestAt = Date.now() + 200;
      currentState.systems.combo = {
        count: 0,
        lastHarvestAt: null,
        expiresAt: null,
        lastRewardedThreshold: 0,
        rewardMoney: 0,
      };
      currentState.plots = currentState.plots.map((plot, index) => ({
        ...plot,
        id: index,
        state: index === 1 ? "empty" : "growing",
        plantedAt: index === 1 ? null : Date.now(),
        readyAt: index === 1 ? null : Date.now() + growthDurationMs,
        rottenAt: null,
        growthDurationMs: index === 1 ? null : growthDurationMs,
      }));
      window.__strawberryFarmDebug.setState(currentState);
    });
    await page.waitForFunction(() => Number(document.querySelector("#seedCount")?.textContent || "0") === 1, {
      timeout: 5000,
    });
    assert(
      (await page.locator(".plot").nth(1).getAttribute("aria-label"))?.includes("Crescendo"),
      "O helper deveria voltar a plantar apos reload quando o upgrade persistiu.",
    );

    await resetComboState(page);
    await clearEvent(page);
    await ensureAtLeastOneSeed(page);
    await plantAllAvailableSeeds(page);
    await waitForAnyReadyPlot(page, 12000);
    const berriesBeforeHelperReloadHarvest = await numberOf(page, "#berryCount");
    await setHelperNextHarvestIn(page, 200);
    await page.reload({ waitUntil: "load" });
    await disableRandomEvents(page);
    await page.waitForFunction(
      (currentBerries) => Number(document.querySelector("#berryCount")?.textContent || "0") >= currentBerries + 1,
      berriesBeforeHelperReloadHarvest,
      { timeout: 5000 },
    );
    const comboAfterHelperReload = await getComboSnapshot(page);
    assert(comboAfterHelperReload.count === 0, "O helper não deveria recriar combo após reload.");

    console.log("Cenário 8: Strawberry Knowledge, reset opcional e persistência");
    await clearEvent(page);
    await preparePrestigeAvailability(page, 120);
    assert(
      (await textOf(page, "#prestigeThresholdText")).includes("Disponível com"),
      "O painel de prestígio deveria indicar disponibilidade ao atingir o requisito.",
    );
    assert(
      (await textOf(page, "#milestoneToast")).includes("Conhecimento do Morango") ||
        (await textOf(page, "#prestigePanelDescription")).includes("Disponível:"),
      "A UI deveria deixar claro que o prestígio foi desbloqueado.",
    );
    assert(!(await page.locator("#prestigeButton").isDisabled()), "O botão de prestígio deveria ficar ativo.");
    // Neutralize prestige-1 goal reward (seeds: +5) before triggering prestige to avoid seed count contamination.
    await page.evaluate(() => {
      const currentState = window.__strawberryFarmDebug.getState();
      if (!currentState.progression.completedGoalIds.includes("prestige-1")) {
        currentState.progression.completedGoalIds.push("prestige-1");
      }
      window.__strawberryFarmDebug.setState(currentState);
    });
    page.once("dialog", (dialog) => {
      dialog.accept().catch(() => {});
    });
    await page.click("#prestigeButton");
    await waitForText(page, "#statusMessage", "Conhecimento nível 1");
    assert((await textOf(page, "#moneyCount")) === "6", "O prestígio deveria reiniciar o dinheiro.");
    assert((await textOf(page, "#seedCount")) === "3", "O prestígio deveria reiniciar as sementes.");
    assert((await textOf(page, "#plotCountValue")) === "9/16", "O prestígio deveria reiniciar a fazenda para 3x3.");
    assert((await textOf(page, "#helperStatusValue")) === "Off", "O prestígio deveria remover o helper.");
    assert((await textOf(page, "#prestigeLevelValue")) === "Nível 1", "O nível de prestígio não subiu após o reset.");
    assert((await textOf(page, "#prestigeBonusHint")).includes("+20%"), "O bônus permanente não foi aplicado após o prestígio.");
    assert((await textOf(page, "#prestigeThresholdText")).includes("240"), "O próximo requisito de prestígio deveria escalar após o nível 1.");

    await page.reload({ waitUntil: "load" });
    await disableRandomEvents(page);
    assert((await textOf(page, "#prestigeLevelValue")) === "Nível 1", "O nível de prestígio não persistiu após reload.");
    assert((await textOf(page, "#prestigeBonusHint")).includes("+20%"), "O bônus de prestígio não persistiu após reload.");

    await setMarketState(page, { currentPrice: 3, previousPrice: 3, nextUpdateInMs: 30000 });
    const moneyBeforePrestigeSale = await numberOf(page, "#moneyCount");
    await page.locator(".plot").nth(0).click();
    await waitForAllGrowingPlots(page, 12000);
    await harvestAllReadyPlots(page);
    await page.click("#sellButton");
    assert(
      (await numberOf(page, "#moneyCount")) === moneyBeforePrestigeSale + 4,
      "A venda após o prestígio deveria aplicar o bônus permanente de +20%.",
    );

    console.log("Cenário 9: progressão após prestígio");
    await preparePostPrestigeProgression(page);
    await openUpgradesTab(page);
    await page.click("#expandFarmButton");
    await page.click("#fertilizerButton");
    await page.click("#marketButton");
    assert(
      (await textOf(page, "#goalStatus")) === "Meta concluída",
      "A mensagem final de vitória não apareceu ao alcançar 35 moedas.",
    );
    assert((await textOf(page, "#progressSummary")) === "8/8 metas", "As metas finais não foram concluídas.");

    console.log("Cenário 10: reset e restauração completa");
    page.once("dialog", (dialog) => {
      dialog.accept().catch(() => {});
    });
    await page.click("#resetButton");
    await waitForText(page, "#statusMessage", "Comece plantando.");
    assert((await page.locator(".plot").count()) === 9, "O reset não voltou a fazenda para 3x3.");
    assert((await textOf(page, "#plotCountValue")) === "9/16", "O HUD não restaurou o tamanho inicial da fazenda.");
    assert((await textOf(page, "#sellPriceValue")) === "3 moedas", "O reset não restaurou o preço base de venda.");
    assert((await textOf(page, "#growthTimeValue")) === "10s", "O reset não restaurou o tempo base.");
    assert((await textOf(page, "#eventTitle")) === "Sem evento", "O reset não limpou o evento ativo.");
    assert((await textOf(page, "#progressSummary")) === "0/8 metas", "O reset não limpou as metas.");
    assert((await textOf(page, "#prestigeLevelValue")) === "Nível 0", "O reset total deveria limpar o prestígio.");
    assert((await textOf(page, "#prestigeBonusHint")).includes("+0%"), "O reset total deveria limpar o bônus permanente.");

    console.log("Cenário 11: layout mobile razoável");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: "load" });
    await disableRandomEvents(page);
    assert((await page.locator(".plot").count()) === 9, "O mobile deveria continuar exibindo a fazenda.");
    assert(await page.locator("#buySeedButton").isVisible(), "A ação de comprar semente deveria continuar visível no mobile.");
    assert(await page.locator("#goalStatus").isVisible(), "A meta principal deveria continuar visível no mobile.");

    await page.screenshot({
      path: SUCCESS_SCREENSHOT_PATH,
      fullPage: true,
    });

    console.log("✅ QA principal passou para layout, economia, helper, prestígio, combo, eventos e save/load.");
    console.log(`📸 Screenshot salva em ${SUCCESS_SCREENSHOT_PATH}`);
  } catch (error) {
    console.error("❌ Falha no teste:", error.message);
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
