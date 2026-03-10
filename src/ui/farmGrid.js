(function (SF) {
  SF.ui = SF.ui || {};

  function createFarmGrid(game) {
    game.elements.farmGrid.innerHTML = "";
    game.plotElements.length = 0;

    game.state.plots.slice(0, game.state.unlockedPlotCount).forEach((_, index) => {
      const plotButton = document.createElement("button");
      plotButton.type = "button";
      plotButton.className = "plot";
      plotButton.addEventListener("click", () => game.handlePlotClick(index));

      const emoji = document.createElement("div");
      emoji.className = "plot__emoji";

      const badge = document.createElement("div");
      badge.className = "plot__badge";

      const name = document.createElement("div");
      name.className = "plot__name";

      const stage = document.createElement("div");
      stage.className = "plot__stage";

      const timer = document.createElement("div");
      timer.className = "plot__timer";

      const progressTrack = document.createElement("div");
      progressTrack.className = "plot__progress";

      const progressFill = document.createElement("div");
      progressFill.className = "plot__progress-fill";
      progressTrack.append(progressFill);

      const hint = document.createElement("div");
      hint.className = "plot__hint";

      plotButton.append(badge, emoji, name, stage, timer, progressTrack, hint);
      game.elements.farmGrid.append(plotButton);
      game.plotElements.push({
        button: plotButton,
        badge,
        emoji,
        name,
        stage,
        timer,
        progressTrack,
        progressFill,
        hint,
      });
    });
  }

  function renderFarmGrid(game, farmMetrics, now = Number.isFinite(game?.runtime?.now) ? game.runtime.now : 0) {
    if (game.plotElements.length !== game.state.unlockedPlotCount) {
      createFarmGrid(game);
    }

    game.elements.farmGrid.classList.toggle("farm-grid--expanded", game.state.hasExpandedFarm);

    game.state.plots.slice(0, game.state.unlockedPlotCount).forEach((plot, index) => {
      const plotElement = game.plotElements[index];

      if (!plotElement) {
        return;
      }

      const progress = SF.plots.getPlotProgress(plot, now);
      plotElement.button.className = `plot plot--${plot.state}`;
      plotElement.button.setAttribute("aria-label", SF.plots.getPlotLabel(plot, index, now));
      plotElement.badge.textContent = SF.plots.getPlotBadge(plot);
      plotElement.emoji.textContent = SF.plots.getPlotEmoji(plot);
      plotElement.name.textContent = SF.plots.getPlotName(plot);
      plotElement.stage.textContent = SF.plots.getPlotStageText(plot, now);
      plotElement.timer.textContent = SF.plots.getPlotTimerText(plot, now);
      plotElement.hint.textContent = SF.plots.getPlotHint(plot, now);
      plotElement.progressFill.style.width = `${progress}%`;
      plotElement.progressTrack.hidden = plot.state !== SF.config.plotStates.growing;
      plotElement.button.classList.toggle(
        "plot--attention",
        plot.state === SF.config.plotStates.ready && farmMetrics.readyPlots > 0,
      );
      plotElement.button.classList.toggle("plot--harvested", game.uiState.harvestedPlots[plot.id]?.source === "manual");
      plotElement.button.classList.toggle(
        "plot--harvested-auto",
        game.uiState.harvestedPlots[plot.id]?.source === "helper",
      );
    });
  }

  SF.ui.createFarmGrid = createFarmGrid;
  SF.ui.renderFarmGrid = renderFarmGrid;
})(window.StrawberryFarm = window.StrawberryFarm || {});
