import { ButtonV2 } from "@rootcodelabs/skapp-ui";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import LeavePolicyAllocation from "~community/leave/components/molecules/LeavePolicyAllocation/LeavePolicyAllocation";
import { PolicyLeaveModalEnums } from "~community/leave/enums/PolicyLeaveEnums";
import { usePolicyLeaveStore } from "~community/leave/store/policyLeaveStore";

/**
 * The My Allocation picker. Rows are individual policies, not leave types — so
 * "Annual Leave — Policy A" and "Annual Leave — Policy B" are two selectable rows.
 */
const PolicySelectionModal = () => {
  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "policySelectionModal"
  );

  const { setModalType } = usePolicyLeaveStore();

  return (
    <div className="flex flex-col gap-4">
      <LeavePolicyAllocation />
      <ButtonV2
        variant={"tertiary"}
        onClick={() => setModalType(PolicyLeaveModalEnums.NONE)}
        icon={<Icon name={IconName.CLOSE_ICON} />}
        iconPosition="end"
      >
        {translateText(["cancelBtn"])}
      </ButtonV2>
    </div>
  );
};

export default PolicySelectionModal;
