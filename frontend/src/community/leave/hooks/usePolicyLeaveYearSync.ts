import { useEffect } from "react";

import { usePolicyLeaveStore } from "~community/leave/store/policyLeaveStore";
import { useLeaveStore } from "~community/leave/store/store";

const usePolicyLeaveYearSync = (): void => {
  const selectedYear = useLeaveStore((state) => state.selectedYear);
  const setPolicySelectedYear = usePolicyLeaveStore(
    (state) => state.setSelectedYear
  );
  const policySelectedYear = usePolicyLeaveStore((state) => state.selectedYear);

  useEffect(() => {
    if (selectedYear && selectedYear !== policySelectedYear) {
      setPolicySelectedYear(selectedYear);
    }
  }, [selectedYear, policySelectedYear, setPolicySelectedYear]);
};

export default usePolicyLeaveYearSync;
