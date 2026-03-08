(function (SF) {
  function getEventDefinition(eventId) {
    return SF.config.events.definitions.find((event) => event.id === eventId) || null;
  }

  function getActiveEventDefinition(game) {
    if (!game.state.systems.activeEvent) {
      return null;
    }

    return getEventDefinition(game.state.systems.activeEvent.id);
  }

  function activateEvent(game, eventId, durationMs, isForced = false) {
    const eventDefinition = getEventDefinition(eventId);

    if (!eventDefinition) {
      return;
    }

    game.state.systems.activeEvent = {
      id: eventDefinition.id,
      endsAt: Date.now() + durationMs,
      durationMs,
    };

    if (eventDefinition.activePlotRemainingMultiplier) {
      accelerateGrowingPlots(game, eventDefinition.activePlotRemainingMultiplier);
    }

    if (!isForced) {
      game.state.stats.eventsTriggered += 1;
      game.setMessage(`Evento ativo: ${eventDefinition.title}.`);
    }
  }

  function accelerateGrowingPlots(game, remainingMultiplier) {
    const now = Date.now();

    SF.plots.getVisiblePlots(game).forEach((plot) => {
      if (plot.state !== SF.config.plotStates.growing || !Number.isFinite(plot.readyAt)) {
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

  function clearActiveEvent(game) {
    game.state.systems.activeEvent = null;
  }

  function updateActiveEvent(game) {
    if (!game.state.systems.activeEvent) {
      return false;
    }

    if (Date.now() < game.state.systems.activeEvent.endsAt) {
      return false;
    }

    game.state.systems.activeEvent = null;
    return true;
  }

  function getEventTags(game, activeEvent) {
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

  function getEventDurationMs(game, eventDefinition) {
    if (!game.state.systems.activeEvent || !eventDefinition) {
      return SF.config.events.durationMs;
    }

    return game.state.systems.activeEvent.durationMs || SF.config.events.durationMs;
  }

  function getEventEffectText(game, activeEvent) {
    if (activeEvent.sellPriceBonus) {
      return `+${activeEvent.sellPriceBonus} por morango.`;
    }

    if (activeEvent.seedPriceDiscount) {
      return `Semente por ${SF.plots.getSeedPrice(game)}.`;
    }

    if (activeEvent.growthMultiplier) {
      return `Crescimento em ${SF.utils.formatSeconds(SF.plots.getGrowthTimeMs(game))}.`;
    }

    return "Sem bônus.";
  }

  SF.events = {
    getEventDefinition,
    getActiveEventDefinition,
    activateEvent,
    accelerateGrowingPlots,
    clearActiveEvent,
    updateActiveEvent,
    getEventTags,
    getEventDurationMs,
    getEventEffectText,
  };
})(window.StrawberryFarm = window.StrawberryFarm || {});
