const path = require("path");
const { pathToFileURL } = require("url");
const { chromium } = require("playwright");

const TARGET_URL =
  process.env.TARGET_URL ||
  pathToFileURL(path.resolve(__dirname, "../../index.html")).href;

const STORAGE_KEY = "strawberry-farm-save";

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
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });

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
    assert((await textOf(page, "#progressSummary")) === "0 de 4 metas concluídas", "Resumo inicial de metas incorreto.");
    assert((await textOf(page, "#eventTitle")) === "Nenhum evento ativo", "O banner de evento deveria iniciar vazio.");

    console.log("Cenário 2: plantio e save/load base");
    const firstPlot = page.locator(".plot").nth(0);
    await firstPlot.click();
    await waitForText(page, "#statusMessage", "Semente plantada");
    await page.reload({ waitUntil: "load" });
    await disableRandomEvents(page);
    await page.waitForFunction(() => {
      const plot = document.querySelector(".plot");
      return plot && plot.textContent && plot.textContent.includes("Crescendo");
    });
    assert((await textOf(page, "#plotCountValue")) === "9/16", "O save/load corrompeu o tamanho base da fazenda.");

    console.log("Cenário 3: expansão da fazenda para 4x4");
    await reachMoneyTarget(page, 12);
    await page.click("#expandFarmButton");
    await page.waitForFunction(() => {
      const expansionButton = document.querySelector("#expandFarmButton");
      const plotCount = document.querySelector("#plotCountValue");
      return (
        expansionButton &&
        expansionButton.textContent &&
        expansionButton.textContent.includes("Fazenda expandida") &&
        plotCount &&
        plotCount.textContent === "16/16"
      );
    });
    assert((await page.locator(".plot").count()) === 16, "A expansão não liberou 16 canteiros.");
    assert((await textOf(page, "#plotCountValue")) === "16/16", "HUD não refletiu a fazenda expandida.");
    await page.reload({ waitUntil: "load" });
    await disableRandomEvents(page);
    assert((await page.locator(".plot").count()) === 16, "A expansão não persistiu após reload.");

    console.log("Cenário 4: evento Feira local e economia de sementes");
    await forceEvent(page, "market-day", 5000);
    await waitForText(page, "#eventTitle", "Feira local");
    assert((await textOf(page, "#buySeedButton")) === "Comprar semente (1)", "A Feira local não reduziu o preço da semente.");
    const moneyBeforeDiscountSeed = await numberOf(page, "#moneyCount");
    await page.click("#buySeedButton");
    assert(
      (await numberOf(page, "#moneyCount")) === moneyBeforeDiscountSeed - 1,
      "A compra de semente durante a Feira local não descontou 1 moeda.",
    );
    await page.reload({ waitUntil: "load" });
    await disableRandomEvents(page);
    await waitForText(page, "#eventTitle", "Feira local");
    assert((await textOf(page, "#buySeedButton")) === "Comprar semente (1)", "O evento ativo não persistiu após reload.");
    await page.waitForFunction(() => {
      const title = document.querySelector("#eventTitle");
      return title && title.textContent === "Nenhum evento ativo";
    }, { timeout: 8000 });
    assert((await textOf(page, "#buySeedButton")) === "Comprar semente (2)", "O preço da semente não voltou ao normal após o evento.");

    console.log("Cenário 5: upgrade de crescimento e timing da chuva");
    await reachMoneyTarget(page, 12);
    await page.click("#fertilizerButton");
    await page.waitForFunction(() => {
      const button = document.querySelector("#fertilizerButton");
      const timeValue = document.querySelector("#growthTimeValue");
      return button && button.textContent.includes("Adubo ativo") && timeValue.textContent === "8s";
    });
    await forceEvent(page, "drizzle", 4000);
    await waitForText(page, "#eventTitle", "Chuva leve");
    assert((await textOf(page, "#growthTimeValue")) === "6s", "A Chuva leve não acelerou o tempo junto com o adubo.");
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
      return title && title.textContent === "Nenhum evento ativo" && growth && growth.textContent === "8s";
    }, { timeout: 9000 });

    console.log("Cenário 6: upgrade de venda e economia do evento Sol forte");
    await reachMoneyTarget(page, 15);
    await page.click("#marketButton");
    await page.waitForFunction(() => {
      const button = document.querySelector("#marketButton");
      const sellValue = document.querySelector("#sellPriceValue");
      return button && button.textContent.includes("Venda melhorada") && sellValue.textContent === "5 moedas";
    });
    await ensureAtLeastOneSeed(page);
    await plantAllAvailableSeeds(page);
    await waitForAnyReadyPlot(page, 10000);
    await harvestAllReadyPlots(page);
    assert(!(await page.locator("#sellButton").isDisabled()), "Era esperado ter morangos para vender antes do Sol forte.");
    await forceEvent(page, "sunshine", 5000);
    await waitForText(page, "#eventTitle", "Sol forte");
    assert((await textOf(page, "#sellPriceValue")) === "6 moedas", "O Sol forte não aumentou o preço de venda.");
    const moneyBeforeSunnySale = await numberOf(page, "#moneyCount");
    await page.click("#sellButton");
    assert(
      (await numberOf(page, "#moneyCount")) >= moneyBeforeSunnySale + 6,
      "A venda durante o Sol forte não recebeu o bônus esperado.",
    );
    await clearEvent(page);
    assert((await textOf(page, "#eventTitle")) === "Nenhum evento ativo", "O evento não foi limpo corretamente no modo de teste.");

    console.log("Cenário 7: progressão final e consistência geral");
    await reachMoneyTarget(page, 35);
    assert(
      (await textOf(page, "#goalStatus")) === "Você construiu uma pequena fazenda de morangos!",
      "A mensagem final de vitória não apareceu ao alcançar 35 moedas.",
    );
    assert((await textOf(page, "#progressSummary")) === "4 de 4 metas concluídas", "As metas finais não foram concluídas.");

    console.log("Cenário 8: reset e restauração completa");
    page.once("dialog", (dialog) => {
      dialog.accept().catch(() => {});
    });
    await page.click("#resetButton");
    await waitForText(page, "#statusMessage", "Plante seus primeiros morangos.");
    assert((await page.locator(".plot").count()) === 9, "O reset não voltou a fazenda para 3x3.");
    assert((await textOf(page, "#plotCountValue")) === "9/16", "O HUD não restaurou o tamanho inicial da fazenda.");
    assert((await textOf(page, "#sellPriceValue")) === "3 moedas", "O reset não restaurou o preço base de venda.");
    assert((await textOf(page, "#growthTimeValue")) === "10s", "O reset não restaurou o tempo base.");
    assert((await textOf(page, "#eventTitle")) === "Nenhum evento ativo", "O reset não limpou o evento ativo.");
    assert((await textOf(page, "#progressSummary")) === "0 de 4 metas concluídas", "O reset não limpou as metas.");

    await page.screenshot({
      path: "/tmp/strawberry-farm-test.png",
      fullPage: true,
    });

    console.log("✅ QA principal passou para economia, eventos e save/load.");
    console.log("📸 Screenshot salva em /tmp/strawberry-farm-test.png");
  } catch (error) {
    console.error("❌ Falha no teste:", error.message);
    await page
      .screenshot({
        path: "/tmp/strawberry-farm-test-error.png",
        fullPage: true,
      })
      .catch(() => {});
    console.error("📸 Screenshot de erro salva em /tmp/strawberry-farm-test-error.png");
    throw error;
  } finally {
    await browser.close();
  }
})();
