(function (SF) {
  function hasReachedGoal(game, goal) {
    if (goal.targetType === "harvestedTotal") {
      return game.state.stats.harvestedTotal >= goal.targetValue;
    }

    if (goal.targetType === "upgradesPurchased") {
      return game.state.stats.upgradesPurchased >= goal.targetValue;
    }

    if (goal.targetType === "money") {
      return game.state.money >= goal.targetValue;
    }

    if (goal.targetType === "expandedFarm") {
      return game.state.hasExpandedFarm;
    }

    return false;
  }

  function grantGoalReward(game, reward) {
    if (!reward) {
      return "";
    }

    const rewardParts = [];

    if (Number.isFinite(reward.money) && reward.money > 0) {
      game.state.money += reward.money;
      rewardParts.push(`Recompensa: +${reward.money} moedas.`);
    }

    if (Number.isFinite(reward.seeds) && reward.seeds > 0) {
      game.state.seeds += reward.seeds;
      rewardParts.push(`Recompensa: +${reward.seeds} sementes.`);
    }

    return rewardParts.join(" ");
  }

  function applyProgressionGoals(game) {
    const unlockedMessages = [];

    SF.config.progressionGoals.forEach((goal) => {
      if (game.state.progression.completedGoalIds.includes(goal.id)) {
        return;
      }

      if (!hasReachedGoal(game, goal)) {
        return;
      }

      game.state.progression.completedGoalIds.push(goal.id);
      const rewardMessage = grantGoalReward(game, goal.reward);
      unlockedMessages.push(
        rewardMessage ? `Meta concluída: ${goal.title}. ${rewardMessage}` : `Meta concluída: ${goal.title}.`,
      );
    });

    return unlockedMessages;
  }

  function maybeNotifyPrestigeUnlocked(game) {
    if (!SF.prestige.isPrestigeAvailable(game)) {
      return "";
    }

    if (game.state.systems.prestige.unlockShownForLevel === game.state.prestige.level) {
      return "";
    }

    game.state.systems.prestige.unlockShownForLevel = game.state.prestige.level;
    return `Conhecimento do Morango disponível. Prestigie para ganhar +${SF.prestige.getPrestigeBonusPercent(game, game.state.prestige.level + 1)}% permanente nas vendas.`;
  }

  SF.progression = {
    hasReachedGoal,
    grantGoalReward,
    applyProgressionGoals,
    maybeNotifyPrestigeUnlocked,
  };
})(window.StrawberryFarm = window.StrawberryFarm || {});
