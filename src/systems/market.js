(function (SF) {
  function normalizeMarketPrice(price) {
    if (!Number.isFinite(price)) {
      return SF.config.market.basePrice;
    }

    return Math.max(SF.config.market.minPrice, Math.min(SF.config.market.maxPrice, Math.round(price)));
  }

  function getRandomMarketStep(game) {
    if (game.debugState.forcedMarketSteps.length > 0) {
      return game.debugState.forcedMarketSteps.shift();
    }

    const randomIndex = Math.floor(Math.random() * SF.config.market.stepOptions.length);
    return SF.config.market.stepOptions[randomIndex];
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

  function updateMarketState(game, now = Date.now()) {
    const market = game.state.systems.market;

    if (!market || !Number.isFinite(market.nextUpdateAt)) {
      return false;
    }

    let changed = false;
    let guard = 0;

    while (now >= market.nextUpdateAt && guard < 6) {
      const previousPrice = normalizeMarketPrice(market.currentPrice);
      const nextPrice = normalizeMarketPrice(previousPrice + getRandomMarketStep(game));

      market.previousPrice = previousPrice;
      market.currentPrice = nextPrice;
      market.direction = getMarketDirection(nextPrice, previousPrice);
      market.nextUpdateAt += SF.config.market.updateIntervalMs;
      changed = true;
      guard += 1;
    }

    if (market.nextUpdateAt < now) {
      market.nextUpdateAt = now + SF.config.market.updateIntervalMs;
    }

    return changed;
  }

  function getMarketBasePrice(game) {
    return normalizeMarketPrice(game.state.systems.market.currentPrice);
  }

  function getSellPrice(game) {
    let sellPrice = getMarketBasePrice(game);
    const marketLevel = SF.upgrades.getUpgradeLevel(game, "market");

    if (marketLevel > 0) {
      sellPrice += SF.upgrades.getMarketSellBonus(marketLevel);
    }

    const activeEvent = SF.events.getActiveEventDefinition(game);
    if (activeEvent?.sellPriceBonus) {
      sellPrice += activeEvent.sellPriceBonus;
    }

    return sellPrice;
  }

  function getSellPriceHint(game) {
    const marketBasePrice = getMarketBasePrice(game);
    const direction = game.state.systems.market.direction;
    const prestigeText = game.state.prestige.level > 0 ? ` +${SF.prestige.getPrestigeBonusPercent(game)}%` : "";

    if (direction === "up") {
      return `Alta: ${marketBasePrice}${prestigeText}`;
    }

    if (direction === "down") {
      return `Baixa: ${marketBasePrice}${prestigeText}`;
    }

    return `Estável: ${marketBasePrice}${prestigeText}`;
  }

  function getMarketHeadline(game) {
    const marketBasePrice = getMarketBasePrice(game);
    const direction = game.state.systems.market.direction;

    if (direction === "up") {
      return `Preço em alta: ${marketBasePrice} moedas`;
    }

    if (direction === "down") {
      return `Preço em baixa: ${marketBasePrice} moedas`;
    }

    return `Preço estável: ${marketBasePrice} moedas`;
  }

  function getMarketDescription(game) {
    const marketBasePrice = getMarketBasePrice(game);

    if (marketBasePrice === SF.config.market.maxPrice) {
      return "Bom momento para vender.";
    }

    if (marketBasePrice === SF.config.market.minPrice) {
      return "Preço baixo. Vale esperar.";
    }

    return "Preço muda com o tempo.";
  }

  function getMarketChangeText(game) {
    const market = game.state.systems.market;
    const difference = market.currentPrice - market.previousPrice;

    if (difference > 0) {
      return `▲ +${difference}`;
    }

    if (difference < 0) {
      return `▼ ${difference}`;
    }

    return "• Sem mudança";
  }

  function getMarketUpdateMessage(game) {
    const marketBasePrice = getMarketBasePrice(game);
    const direction = game.state.systems.market.direction;

    if (direction === "up") {
      return `Mercado em alta. O morango agora vale ${marketBasePrice} moedas antes dos bônus.`;
    }

    if (direction === "down") {
      return `Mercado em baixa. O morango agora vale ${marketBasePrice} moedas antes dos bônus.`;
    }

    return `Mercado estável. O morango segue valendo ${marketBasePrice} moedas antes dos bônus.`;
  }

  SF.market = {
    normalizeMarketPrice,
    getRandomMarketStep,
    getMarketDirection,
    updateMarketState,
    getMarketBasePrice,
    getSellPrice,
    getSellPriceHint,
    getMarketHeadline,
    getMarketDescription,
    getMarketChangeText,
    getMarketUpdateMessage,
  };
})(window.StrawberryFarm = window.StrawberryFarm || {});
