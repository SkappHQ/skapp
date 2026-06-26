const useTier = () => {
  return {
    tiers: [],
    isFreeTier: true,
    isCoreTier: false,
    isProTier: false,
    isOnlyFreeTier: true,
    isAtLeastCoreTier: false,
    isAtLeastProTier: false,
    hasFeature: () => false
  };
};

export default useTier;
