import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { JSX } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { useLeaveStore } from "~community/leave/store/store";
import { LeaveCarryForwardModalTypes } from "~community/leave/types/LeaveCarryForwardTypes";

const LeaveCarryForwardUnEligible = (): JSX.Element => {
  const translateTexts = useTranslator("leaveModule", "leaveCarryForward");
  const { setIsLeaveCarryForwardModalOpen, setLeaveCarryForwardModalType } =
    useLeaveStore((state) => state);

  return (
    <div>
      <p
        className="mb-4 text-gray-900 w-full"
        id="leave-carry-forward-ineligible-modal-description"
      >
        {translateTexts(["leaveCarryForwardUnEligibleModalDescription"]) ?? ""}
      </p>
      <div className="flex flex-row justify-end mt-4">
        <ButtonV2
          type={"submit"}
          onClick={() => {
            setIsLeaveCarryForwardModalOpen(true);
            setLeaveCarryForwardModalType(
              LeaveCarryForwardModalTypes.CARRY_FORWARD
            );
          }}
          icon={<Icon name={IconName.RIGHT_ARROW_ICON} />}
          iconPosition="end"
        >
          {translateTexts(["leaveCarryForwardUnEligibleModalButton"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default LeaveCarryForwardUnEligible;
