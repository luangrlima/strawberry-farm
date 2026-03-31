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

      const visual = document.createElement("div");
      visual.className = "plot__visual";
      visual.setAttribute("aria-hidden", "true");

      const ground = document.createElement("div");
      ground.className = "plot__ground";

      const tilled = document.createElement("div");
      tilled.className = "plot__tilled";

      const crop = document.createElement("div");
      crop.className = "plot__crop";

      const overlay = document.createElement("div");
      overlay.className = "plot__overlay";

      const badge = document.createElement("div");
      badge.className = "plot__chip";

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

      visual.append(ground, tilled, crop, overlay, progressTrack, badge, timer);
      plotButton.append(visual, name, stage, hint);
      game.elements.farmGrid.append(plotButton);
      game.plotElements.push({
        button: plotButton,
        visual,
        ground,
        tilled,
        crop,
        overlay,
        badge,
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

      const visualModel = SF.plots.getPlotVisualModel(plot, now);
      const harvestSource = game.uiState.harvestedPlots[plot.id]?.source;
      const overlayVariant =
        plot.state === SF.config.plotStates.empty && harvestSource === "manual"
          ? "manual-harvest-flash"
          : plot.state === SF.config.plotStates.empty && harvestSource === "helper"
            ? "helper-harvest-flash"
            : visualModel.overlayVariant;

      plotElement.button.className = `plot plot--${plot.state}`;
      plotElement.button.dataset.state = plot.state;
      plotElement.button.setAttribute("aria-label", SF.plots.getPlotLabel(plot, index, now));
      plotElement.badge.textContent = SF.plots.getPlotBadge(plot);
      plotElement.visual.dataset.state = plot.state;
      plotElement.visual.dataset.ground = visualModel.groundVariant;
      plotElement.visual.dataset.tilled = visualModel.tilledVariant;
      plotElement.visual.dataset.crop = visualModel.cropVariant;
      plotElement.visual.dataset.overlay = overlayVariant;
      plotElement.visual.dataset.progress = visualModel.progressVariant;
      plotElement.visual.dataset.accent = visualModel.accentVariant;
      plotElement.ground.dataset.ground = visualModel.groundVariant;
      plotElement.tilled.dataset.tilled = visualModel.tilledVariant;
      plotElement.crop.dataset.crop = visualModel.cropVariant;
      plotElement.overlay.dataset.overlay = overlayVariant;
      plotElement.progressTrack.dataset.progress = visualModel.progressVariant;
      if (Number.isFinite(visualModel.cropFrameX) && Number.isFinite(visualModel.cropFrameY)) {
        plotElement.crop.style.setProperty("--plot-sprite-x", `${visualModel.cropFrameX * 3}px`);
        plotElement.crop.style.setProperty("--plot-sprite-y", `${visualModel.cropFrameY * 3}px`);
      } else {
        plotElement.crop.style.removeProperty("--plot-sprite-x");
        plotElement.crop.style.removeProperty("--plot-sprite-y");
      }
      plotElement.name.textContent = SF.plots.getPlotName(plot);
      plotElement.stage.textContent = SF.plots.getPlotStageText(plot, now);
      plotElement.timer.textContent = SF.plots.getPlotTimerText(plot, now);
      plotElement.hint.textContent = SF.plots.getPlotHint(plot, now);

      if (visualModel.progressVariant === "grow-ring") {
        const progress = SF.plots.getPlotProgress(plot, now);
        plotElement.progressFill.style.width = `${progress}%`;
        plotElement.progressFill.className = "plot__progress-fill";
      } else if (visualModel.progressVariant === "spoil-ring") {
        const spoilProgress = SF.plots.getSpoilProgress(plot, now);
        plotElement.progressFill.style.width = `${spoilProgress}%`;
        plotElement.progressFill.className = "plot__progress-fill plot__progress-fill--spoil";
      } else {
        plotElement.progressFill.style.width = "0%";
        plotElement.progressFill.className = "plot__progress-fill";
      }

      plotElement.progressTrack.hidden = visualModel.progressVariant === "none";
      plotElement.name.hidden = true;
      plotElement.stage.hidden = true;
      plotElement.hint.hidden = true;
      plotElement.timer.hidden = plot.state === SF.config.plotStates.empty;
      plotElement.button.classList.toggle(
        "plot--attention",
        (plot.state === SF.config.plotStates.ready && farmMetrics.readyPlots > 0) ||
          (plot.state === SF.config.plotStates.rotten && farmMetrics.rottenPlots > 0),
      );
      plotElement.button.classList.toggle("plot--harvested", harvestSource === "manual");
      plotElement.button.classList.toggle("plot--harvested-auto", harvestSource === "helper");
    });
  }

  SF.ui.createFarmGrid = createFarmGrid;
  SF.ui.renderFarmGrid = renderFarmGrid;
})(window.StrawberryFarm = window.StrawberryFarm || {});
