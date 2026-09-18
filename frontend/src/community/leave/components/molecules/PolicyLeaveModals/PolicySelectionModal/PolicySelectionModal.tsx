import { LargeModal } from "@rootcodelabs/skapp-ui";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import LeavePolicyAllocation from "~community/leave/components/molecules/LeavePolicyAllocation/LeavePolicyAllocation";
import { PolicyLeaveModalEnums } from "~community/leave/enums/PolicyLeaveEnums";
import { usePolicyLeaveStore } from "~community/leave/store/policyLeaveStore";

const PolicySelectionModal = () => {
  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "policySelectionModal"
  );

  const translateModalTitle = useTranslator(
    "leaveModule",
    "myRequests",
    "applyPolicyLeaveModal"
  );

  const isModalOpen = usePolicyLeaveStore((state) => state.isModalOpen);
  const setModalType = usePolicyLeaveStore((state) => state.setModalType);

  return (
    <LargeModal
      id="policy-selection-modal"
      isOpen={isModalOpen}
      onClose={() => setModalType(PolicyLeaveModalEnums.NONE)}
      modalHeader={translateModalTitle(["title"])}
      backdropVariant="dark"
      buttons={{
        buttonRight: {
          variant: "tertiary",
          onClick: () => setModalType(PolicyLeaveModalEnums.NONE),
          icon: <Icon name={IconName.CLOSE_ICON} />,
          iconPosition: "end",
          children: translateText(["cancelBtn"])
        }
      }}
      content={
        <div className="flex flex-col gap-4">
          <LeavePolicyAllocation />
        </div>
      }
    />
  );
};

export default PolicySelectionModal;
