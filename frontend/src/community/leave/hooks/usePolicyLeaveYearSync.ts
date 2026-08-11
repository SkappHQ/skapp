import { useEffect } from "react";

import { usePolicyLeaveStore } from "~community/leave/store/policyLeaveStore";
import { useLeaveStore } from "~community/leave/store/store";

const usePolicyLeaveYearSync = (): void => {
  const selectedYear = useLeaveStore((state) => state.selectedYear);
  const {
    selectedYear: policySelectedYear,
    setSelectedYear: setPolicySelectedYear
  } = usePolicyLeaveStore((state) => state);

  useEffect(() => {
    if (selectedYear && selectedYear !== policySelectedYear) {
      setPolicySelectedYear(selectedYear);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, policySelectedYear]);
};

export default usePolicyLeaveYearSync;
