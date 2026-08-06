import {
  BasicFilterStructure,
  SelectableItemList
} from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  pascalCaseFormatter,
  toggleFilterValue
} from "~community/common/utils/commonUtil";
import { useGetMyPolicyBalances } from "~community/leave/api/PolicyLeaveApi";
import { usePolicyLeaveStore } from "~community/leave/store/policyLeaveStore";
import { PolicyLeaveRequestStatus } from "~community/leave/types/PolicyLeaveTypes";
import { policyLeaveStatusFilters } from "~community/leave/utils/policyLeave/policyLeaveUtils";

interface Props {
  onClose: () => void;
}

/**
 * Policy counterpart of MyLeaveRequestFilterBody. The second dimension filters by
 * individual policy rather than by leave type, so two policies sharing a leave type
 * appear as two separate chips.
 */
const PolicyLeaveRequestFilterBody: FC<Props> = ({ onClose }) => {
  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "myLeaveRequests"
  );
  const translateAria = useTranslator(
    "leaveAria",
    "myRequests",
    "myLeaveRequests"
  );
  const translateFilterText = useTranslator("commonComponents", "filterButton");

  const selectedYear = usePolicyLeaveStore((state) => state.selectedYear);
  const appliedStatus = usePolicyLeaveStore(
    (state) => state.requestParams.status
  );
  const appliedPolicyIds = usePolicyLeaveStore(
    (state) => state.requestParams.policyId
  );
  const setRequestFilters = usePolicyLeaveStore(
    (state) => state.setRequestFilters
  );
  const resetRequestFilters = usePolicyLeaveStore(
    (state) => state.resetRequestFilters
  );

  const { data: policyBalances } = useGetMyPolicyBalances(selectedYear);

  const [selectedStatus, setSelectedStatus] =
    useState<PolicyLeaveRequestStatus[]>(appliedStatus);
  const [selectedPolicyIds, setSelectedPolicyIds] = useState<string[]>(
    appliedPolicyIds.map(String)
  );

  const isEmpty = selectedStatus.length === 0 && selectedPolicyIds.length === 0;

  const handleApply = () => {
    setRequestFilters({
      status: selectedStatus,
      policyId: selectedPolicyIds.map(Number)
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedStatus([]);
    setSelectedPolicyIds([]);
    resetRequestFilters();
    onClose();
  };

  return (
    <BasicFilterStructure
      title={translateFilterText(["title"])}
      resetButtonProps={{
        onClick: handleReset,
        disabled: isEmpty,
        children: translateFilterText(["resetBtn"])
      }}
      applyButtonProps={{
        onClick: handleApply,
        children: translateFilterText(["applyBtn"]),
        "aria-label": translateFilterText(["applyBtn"])
      }}
    >
      <section aria-label={translateAria(["statusFilterSection"])}>
        <SelectableItemList
          title={translateText(["filterButtonStatus"])}
          items={policyLeaveStatusFilters.map((status) => ({
            label: pascalCaseFormatter(status),
            value: status
          }))}
          selectedValues={selectedStatus}
          onChipClick={(status) =>
            setSelectedStatus((previous) =>
              toggleFilterValue(previous, status as PolicyLeaveRequestStatus)
            )
          }
        />
      </section>
      <section aria-label={translateAria(["typeFilterSection"])}>
        <SelectableItemList
          title={translateText(["filterButtonPolicy"])}
          items={(policyBalances ?? []).map((balance) => ({
            label: balance.policyName,
            value: String(balance.policyId)
          }))}
          selectedValues={selectedPolicyIds}
          onChipClick={(policyId) =>
            setSelectedPolicyIds((previous) =>
              toggleFilterValue(previous, policyId)
            )
          }
          className="max-h-full"
        />
      </section>
    </BasicFilterStructure>
  );
};

export default PolicyLeaveRequestFilterBody;
