import { ButtonV2 } from "@rootcodelabs/skapp-ui";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { PolicyLeaveModalEnums } from "~community/leave/enums/PolicyLeaveEnums";
import { usePolicyLeaveStore } from "~community/leave/store/policyLeaveStore";

/**
 * Guards against losing a part-filled apply form when the modal is dismissed.
 */
const DiscardPolicyLeaveModal = () => {
  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "discardPolicyLeaveModal"
  );

  const setModalType = usePolicyLeaveStore((state) => state.setModalType);

  return (
    <div className="flex flex-col gap-4">
      <p>{translateText(["description"])}</p>
      <div className="flex flex-row gap-3 justify-end">
        <ButtonV2
          variant={"tertiary"}
          onClick={() => setModalType(PolicyLeaveModalEnums.APPLY_POLICY_LEAVE)}
          icon={<Icon name={IconName.LEFT_ARROW_ICON} />}
          iconPosition="start"
        >
          {translateText(["resumeBtn"])}
        </ButtonV2>
        <ButtonV2
          variant={"error"}
          onClick={() => setModalType(PolicyLeaveModalEnums.NONE)}
          icon={<Icon name={IconName.CLOSE_ICON} />}
          iconPosition="end"
        >
          {translateText(["discardBtn"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default DiscardPolicyLeaveModal;
