(function (SF) {
  SF.runtime = SF.runtime || {};

  function ensureRuntimeState(game) {
    if (!game.runtime) {
      game.runtime = {
        now: Date.now(),
      };
    }

    return game.runtime;
  }

  function setNow(game, now = Date.now()) {
    ensureRuntimeState(game).now = now;
    return now;
  }

  function getNow(game) {
    return ensureRuntimeState(game).now;
  }

  function showMilestoneToast(game, message, now = getNow(game)) {
    game.uiState.milestoneToast = {
      message,
      visibleUntil: now + 5000,
    };
  }

  function resetUiState(game) {
    game.uiState = {
      milestoneToast: null,
      harvestedPlots: {},
    };
  }

  function syncMilestoneToast(game, now = getNow(game)) {
    if (game.uiState.milestoneToast && game.uiState.milestoneToast.visibleUntil <= now) {
      game.uiState.milestoneToast = null;
    }
  }

  function syncUiEffects(game, now = getNow(game)) {
    SF.plots.syncHarvestEffects(game, now);
    syncMilestoneToast(game, now);
  }

  function renderGame(game, renderMode = "full", now = getNow(game)) {
    setNow(game, now);
    syncUiEffects(game, now);

    if (renderMode === "none") {
      return;
    }

    if (renderMode === "live") {
      SF.render.renderLiveState(game, undefined, now);
      return;
    }

    SF.render.render(game, now);
  }

  function reconcileState(game, now = getNow(game), options = {}) {
    setNow(game, now);

    const eventEnded = SF.events.updateActiveEvent(game, now);
    const marketChanged = SF.market.updateMarketState(game, now);
    const comboExpired = SF.combo.updateComboState(game, now);
    const helperPrimed = SF.helper.updateHelperState(game, now);
    const plotsReady = SF.plots.updatePlotsByTime(game, now);
    const helperActed = options.runHelperAction ? SF.helper.runFarmHelper(game, now) : false;

    syncUiEffects(game, now);

    return {
      eventEnded,
      marketChanged,
      comboExpired,
      helperPrimed,
      plotsReady,
      helperActed,
    };
  }

  function applyDerivedState(game, now = getNow(game)) {
    const goalRewards = SF.progression.applyProgressionGoals(game);
    const prestigeToast = SF.progression.maybeNotifyPrestigeUnlocked(game);

    if (goalRewards.length > 0) {
      game.setMessage(goalRewards.join(" "));
      showMilestoneToast(game, goalRewards[goalRewards.length - 1], now);
      return {
        goalRewards,
        prestigeUnlocked: false,
      };
    }

    if (prestigeToast) {
      game.setMessage(`Prestígio liberado em ${SF.prestige.getPrestigeThreshold(game)} moedas.`);
      showMilestoneToast(game, prestigeToast, now);
      return {
        goalRewards,
        prestigeUnlocked: true,
      };
    }

    return {
      goalRewards,
      prestigeUnlocked: false,
    };
  }

  function prime(game, now = Date.now()) {
    reconcileState(game, now);
  }

  function persistState(game, now = getNow(game)) {
    game.dirty = true;
    SF.state.saveState(game, now);
  }

  function persistAndRender(game, renderMode = "full", now = getNow(game), options = {}) {
    if (options.save !== false) {
      persistState(game, now);
    } else if (options.markDirty) {
      game.dirty = true;
    }

    renderGame(game, renderMode, now);
  }

  function commit(game, options = {}) {
    const now = setNow(game, options.now);

    reconcileState(game, now);
    applyDerivedState(game, now);

    persistAndRender(game, options.renderMode || "full", now, {
      save: options.save,
      markDirty: options.save !== false,
    });
  }

  function replaceState(game, nextState, options = {}) {
    const now = setNow(game, options.now);
    const shouldReconcile = typeof options.reconcile === "boolean" ? options.reconcile : !options.hydrate;
    game.state = options.hydrate ? SF.state.hydrateState(nextState, { now }) : nextState;

    if (options.resetUi || options.resetUiState) {
      resetUiState(game);
    }

    if (shouldReconcile) {
      reconcileState(game, now);
    } else {
      syncUiEffects(game, now);
    }

    if (options.derive !== false) {
      applyDerivedState(game, now);
    }

    if (typeof options.message === "string") {
      game.setMessage(options.message);
    }

    const toastMessage = options.toast ?? options.toastMessage ?? options.milestoneToast;
    if (typeof toastMessage === "string") {
      showMilestoneToast(game, toastMessage, now);
    }

    persistAndRender(game, options.renderMode || "full", now, {
      save: options.save,
      markDirty: options.markDirty !== false,
    });
  }

  function showMessage(game, message, options = {}) {
    const now = setNow(game, options.now);
    game.setMessage(message);

    if (options.save) {
      persistState(game, now);
    }

    renderGame(game, options.renderMode || "full", now);
  }

  function tick(game, now = Date.now()) {
    const { eventEnded, marketChanged, comboExpired, plotsReady, helperActed } = reconcileState(game, now, {
      runHelperAction: true,
    });

    if (eventEnded) {
      game.setMessage("Evento encerrado.");
      persistAndRender(game, "full", now, { save: false, markDirty: true });
      return;
    }

    if (marketChanged) {
      game.setMessage(SF.market.getMarketUpdateMessage(game));
      persistAndRender(game, "full", now, { save: false, markDirty: true });
      return;
    }

    if (helperActed) {
      return;
    }

    if (comboExpired) {
      renderGame(game, "live", now);
      return;
    }

    if (plotsReady) {
      game.setMessage("Há morangos prontos.");
      persistAndRender(game, "full", now, { save: false, markDirty: true });
      return;
    }

    renderGame(game, "live", now);
  }

  SF.runtime.getNow = getNow;
  SF.runtime.setNow = setNow;
  SF.runtime.showMilestoneToast = showMilestoneToast;
  SF.runtime.resetUiState = resetUiState;
  SF.runtime.syncMilestoneToast = syncMilestoneToast;
  SF.runtime.syncUiEffects = syncUiEffects;
  SF.runtime.renderGame = renderGame;
  SF.runtime.reconcileState = reconcileState;
  SF.runtime.applyDerivedState = applyDerivedState;
  SF.runtime.prime = prime;
  SF.runtime.persistState = persistState;
  SF.runtime.persistAndRender = persistAndRender;
  SF.runtime.commit = commit;
  SF.runtime.replaceState = replaceState;
  SF.runtime.showMessage = showMessage;
  SF.runtime.tick = tick;
})(window.StrawberryFarm = window.StrawberryFarm || {});
