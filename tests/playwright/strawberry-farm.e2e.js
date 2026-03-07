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

async function waitForText(page, selector, expected) {
  await page.waitForFunction(
    ({ selector: targetSelector, expectedText }) => {
      const element = document.querySelector(targetSelector);
      return element && element.textContent && element.textContent.includes(expectedText);
    },
    { selector, expectedText: expected },
  );
}

async function numberOf(page, selector) {
  return Number(await textOf(page, selector));
}

async function buySeedsUntilFull(page) {
  while (!(await page.locator("#buySeedButton").isDisabled())) {
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

async function waitForAllGrowingPlots(page) {
  await page.waitForFunction(() => {
    const plots = Array.from(document.querySelectorAll(".plot"));
    return plots.every((plot) => !plot.textContent.includes("Crescendo"));
  }, { timeout: 15000 });
}

async function harvestAllReadyPlots(page) {
  const plotCount = await page.locator(".plot").count();

  for (let index = 0; index < plotCount; index += 1) {
    const plot = page.locator(".plot").nth(index);
    const label = await plot.getAttribute("aria-label");

    if (label && label.includes("Colher")) {
      await plot.click();
    }
  }
}

async function reachGoalByPlaying(page) {
  while ((await numberOf(page, "#moneyCount")) < 20) {
    await buySeedsUntilFull(page);
    await plantAllAvailableSeeds(page);

    const growingPlots = await page
      .locator(".plot")
      .evaluateAll((plots) => plots.filter((plot) => plot.textContent.includes("Crescendo")).length);

    assert(growingPlots > 0, "Nenhum canteiro entrou em crescimento durante a tentativa de chegar a 20 moedas.");

    await waitForAllGrowingPlots(page);
    await harvestAllReadyPlots(page);

    if (!(await page.locator("#sellButton").isDisabled())) {
      await page.click("#sellButton");
    }
  }
}

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });

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

    console.log("Cenário 1: renderização inicial");
    await waitForText(page, "h1", "Fazenda de Morangos");
    assert((await page.locator(".plot").count()) === 9, "A grade inicial não possui 9 canteiros.");
    assert((await textOf(page, "#moneyCount")) === "6", "Moedas iniciais incorretas.");
    assert((await textOf(page, "#seedCount")) === "3", "Sementes iniciais incorretas.");
    assert((await textOf(page, "#berryCount")) === "0", "Morangos iniciais incorretos.");
    assert(await page.locator("#sellButton").isDisabled(), "O botão de vender deveria iniciar desabilitado.");

    console.log("Cenário 2: compra de semente");
    await page.click("#buySeedButton");
    assert((await textOf(page, "#moneyCount")) === "4", "Compra de semente não descontou moedas.");
    assert((await textOf(page, "#seedCount")) === "4", "Compra de semente não incrementou sementes.");

    console.log("Cenário 3: plantio e persistência antes da colheita");
    const firstPlot = page.locator(".plot").nth(0);
    await firstPlot.click();
    await waitForText(page, "#statusMessage", "Semente plantada");
    assert((await textOf(page, "#seedCount")) === "3", "Plantio não consumiu semente.");
    await page.waitForFunction(() => {
      const plot = document.querySelector(".plot");
      return plot && plot.textContent && plot.textContent.includes("Crescendo");
    });

    await page.reload({ waitUntil: "load" });
    await page.waitForFunction(() => {
      const plot = document.querySelector(".plot");
      return plot && plot.textContent && (plot.textContent.includes("Crescendo") || plot.textContent.includes("Colher"));
    });
    assert((await textOf(page, "#moneyCount")) === "4", "Estado de moedas não persistiu após reload.");
    assert((await textOf(page, "#seedCount")) === "3", "Estado de sementes não persistiu após reload.");

    console.log("Cenário 4: crescimento automático e colheita");
    await page.waitForFunction(
      () => {
        const plot = document.querySelector(".plot");
        return plot && plot.textContent && plot.textContent.includes("Colher");
      },
      { timeout: 12000 },
    );
    await firstPlot.click();
    assert((await textOf(page, "#berryCount")) === "1", "Colheita não adicionou morango.");
    assert(!(await page.locator("#sellButton").isDisabled()), "O botão de vender deveria estar habilitado.");

    console.log("Cenário 5: venda de morangos");
    await page.click("#sellButton");
    assert((await textOf(page, "#berryCount")) === "0", "Venda não zerou morangos.");
    assert((await textOf(page, "#moneyCount")) === "7", "Venda não creditou moedas corretamente.");

    console.log("Cenário 6: atingir a meta jogando");
    await reachGoalByPlaying(page);
    assert(
      (await textOf(page, "#goalStatus")) === "Você construiu uma pequena fazenda de morangos!",
      "A mensagem de vitória não foi exibida após alcançar 20 moedas jogando.",
    );
    assert((await numberOf(page, "#moneyCount")) >= 20, "O jogo não alcançou 20 moedas no fluxo jogado.");

    console.log("Cenário 7: reset do jogo");
    page.once("dialog", (dialog) => {
      dialog.accept().catch(() => {});
    });
    await page.click("#resetButton");
    await waitForText(page, "#statusMessage", "Plante seus primeiros morangos.");
    assert((await textOf(page, "#moneyCount")) === "6", "Reset não restaurou moedas.");
    assert((await textOf(page, "#seedCount")) === "3", "Reset não restaurou sementes.");
    assert((await textOf(page, "#berryCount")) === "0", "Reset não restaurou morangos.");
    assert((await page.locator(".plot").count()) === 9, "Reset corrompeu a grade.");

    await page.screenshot({
      path: "/tmp/strawberry-farm-test.png",
      fullPage: true,
    });

    console.log("✅ Todos os cenários principais passaram.");
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
