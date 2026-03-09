(function (SF) {
  function getUpgradeConfig(upgradeKey) {
    return SF.config.upgrades[upgradeKey];
  }

  function normalizeLeveledUpgradeValue(value, maxLevel) {
    if (typeof value === "boolean") {
      return value ? 1 : 0;
    }

    if (!Number.isFinite(value)) {
      return 0;
    }

    return Math.max(0, Math.min(maxLevel, Math.floor(value)));
  }

  function getUpgradeLevel(gameOrState, upgradeKey) {
    const state = gameOrState?.state || gameOrState;
    const upgradeConfig = getUpgradeConfig(upgradeKey);
    return normalizeLeveledUpgradeValue(state?.upgrades?.[upgradeKey], upgradeConfig.maxLevel);
  }

  function isMaxLevel(gameOrState, upgradeKey) {
    return getUpgradeLevel(gameOrState, upgradeKey) >= getUpgradeConfig(upgradeKey).maxLevel;
  }

  function getUpgradeCost(upgradeKey, currentLevel) {
    const upgradeConfig = getUpgradeConfig(upgradeKey);

    if (currentLevel >= upgradeConfig.maxLevel) {
      return null;
    }

    return upgradeConfig.baseCost + currentLevel * upgradeConfig.costStep;
  }

  function getFertilizerGrowthMultiplier(level) {
    return Math.pow(getUpgradeConfig("fertilizer").growthMultiplierPerLevel, Math.max(0, level));
  }

  function getFertilizerReductionPercent(level) {
    return Math.round((1 - getFertilizerGrowthMultiplier(level)) * 100);
  }

  function getMarketSellBonus(level) {
    return Math.max(0, level) * getUpgradeConfig("market").sellPriceBonusPerLevel;
  }

  SF.upgrades = {
    getUpgradeConfig,
    normalizeLeveledUpgradeValue,
    getUpgradeLevel,
    isMaxLevel,
    getUpgradeCost,
    getFertilizerGrowthMultiplier,
    getFertilizerReductionPercent,
    getMarketSellBonus,
  };
})(window.StrawberryFarm = window.StrawberryFarm || {});
