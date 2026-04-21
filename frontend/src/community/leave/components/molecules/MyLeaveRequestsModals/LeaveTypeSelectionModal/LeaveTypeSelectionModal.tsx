import { ButtonV2 } from "@rootcodelabs/skapp-ui";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import LeaveAllocation from "~community/leave/components/molecules/LeaveAllocation/LeaveAllocation";
import { MyRequestModalEnums } from "~community/leave/enums/MyRequestEnums";
import { useLeaveStore } from "~community/leave/store/store";

const LeaveTypeSelectionModal = () => {
  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "leaveTypeSelectionModal"
  );

  const { setMyLeaveRequestModalType } = useLeaveStore();

  return (
    <div className="flex flex-col gap-4">
      <LeaveAllocation />
      <ButtonV2
        variant={"tertiary"}
        onClick={() => setMyLeaveRequestModalType(MyRequestModalEnums.NONE)}
        icon={<Icon name={IconName.RIGHT_ARROW_ICON} />}
        iconPosition="end"
      >
        {translateText(["cancelBtn"])}
      </ButtonV2>
    </div>
  );
};

export default LeaveTypeSelectionModal;
