import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { JSX } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";

interface Props {
  handleClose: () => void;
}

const NoCarryForwardLeaveTypes = ({ handleClose }: Props): JSX.Element => {
  const translateTexts = useTranslator("leaveModule", "leaveCarryForward");
  return (
    <div>
      <p
        className="mb-4 text-gray-900 w-full"
        id="no-carry-forward-leave-types-modal-description"
      >
        {translateTexts([
          "leaveCarryForwardLeaveTypesNotAvailableModalDescription"
        ]) ?? ""}
      </p>
      <div className="flex justify-end mt-4">
        <ButtonV2
          type={"submit"}
          onClick={() => {
            handleClose();
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

export default NoCarryForwardLeaveTypes;
