import { LargeModal } from "@rootcodelabs/skapp-ui";

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

  const translateModalTitle = useTranslator(
    "leaveModule",
    "myRequests",
    "applyLeaveModal"
  );

  const { isMyRequestModalOpen, setMyLeaveRequestModalType } = useLeaveStore();

  return (
    <LargeModal
      id="leave-type-selection-modal"
      isOpen={isMyRequestModalOpen}
      onClose={() => setMyLeaveRequestModalType(MyRequestModalEnums.NONE)}
      modalHeader={translateModalTitle(["title"])}
      backdropVariant="dark"
      buttons={{
        buttonRight: {
          variant: "tertiary",
          onClick: () => setMyLeaveRequestModalType(MyRequestModalEnums.NONE),
          icon: <Icon name={IconName.RIGHT_ARROW_ICON} />,
          iconPosition: "end",
          children: translateText(["cancelBtn"])
        }
      }}
      content={
        <div className="flex flex-col gap-4">
          <LeaveAllocation />
        </div>
      }
    />
  );
};

export default LeaveTypeSelectionModal;
