import { useState } from "react";

interface DealClearedNotice {
  isDealClearedNoticeVisible: boolean;
  handleDealCleared: () => void;
  handleDealChange: (dealId: number | null) => void;
}

export const useDealClearedNotice = (
  setDealId: (dealId: number | null) => void
): DealClearedNotice => {
  const [isDealClearedNoticeVisible, setIsDealClearedNoticeVisible] =
    useState(false);

  const handleDealCleared = (): void => {
    setDealId(null);
    setIsDealClearedNoticeVisible(true);
  };

  const handleDealChange = (dealId: number | null): void => {
    setDealId(dealId);
    setIsDealClearedNoticeVisible(false);
  };

  return { isDealClearedNoticeVisible, handleDealCleared, handleDealChange };
};
