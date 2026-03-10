(function (SF) {
  function getUnlockedComboThreshold(count, lastRewardedThreshold) {
    return (
      [...SF.config.combo.thresholds]
        .sort((left, right) => left.count - right.count)
        .find((threshold) => count >= threshold.count && threshold.count > lastRewardedThreshold) || null
    );
  }

  function getNextComboThreshold(count) {
    return SF.config.combo.thresholds.find((threshold) => threshold.count > count) || null;
  }

  function applyHarvestCombo(game, now = Date.now()) {
    const combo = game.state.systems.combo;
    const comboStillActive = Number.isFinite(combo.expiresAt) && now < combo.expiresAt;

    if (comboStillActive) {
      combo.count += 1;
    } else {
      combo.count = 1;
      combo.lastRewardedThreshold = 0;
      combo.rewardMoney = 0;
    }

    combo.lastHarvestAt = now;
    combo.expiresAt = now + SF.config.combo.windowMs;

    const unlockedThreshold = getUnlockedComboThreshold(combo.count, combo.lastRewardedThreshold);
    const bonusMoney = unlockedThreshold ? unlockedThreshold.moneyBonus : 0;

    if (unlockedThreshold) {
      combo.lastRewardedThreshold = unlockedThreshold.count;
      combo.rewardMoney = bonusMoney;
    } else if (!comboStillActive) {
      combo.rewardMoney = 0;
    }

    return {
      count: combo.count,
      bonusMoney,
    };
  }

  function resetCombo(game) {
    game.state.systems.combo = {
      count: 0,
      lastHarvestAt: null,
      expiresAt: null,
      lastRewardedThreshold: 0,
      rewardMoney: 0,
    };
  }

  function updateComboState(game, now = Date.now()) {
    const combo = game.state.systems.combo;

    if (!combo || !Number.isFinite(combo.expiresAt)) {
      return false;
    }

    if (now < combo.expiresAt) {
      return false;
    }

    resetCombo(game);
    return true;
  }

  SF.combo = {
    getUnlockedComboThreshold,
    getNextComboThreshold,
    applyHarvestCombo,
    resetCombo,
    updateComboState,
  };
})(window.StrawberryFarm = window.StrawberryFarm || {});
