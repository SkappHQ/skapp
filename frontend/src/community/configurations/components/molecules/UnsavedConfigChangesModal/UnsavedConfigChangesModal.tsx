import { ButtonV2, SmallModal } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";

interface Props {
  isOpen: boolean;
  onStay: () => void;
  onLeave: () => void;
}

const UnsavedConfigChangesModal: FC<Props> = ({ isOpen, onStay, onLeave }) => {
  const translateText = useTranslator("configurations", "unsavedChangesModal");

  return (
    <SmallModal
      isOpen={isOpen}
      onClose={onStay}
      modalHeader={translateText(["title"])}
      role="alertdialog"
      closeButtonAriaLabel={translateText(["aria", "closeButton"])}
      content={
        <div>
          <p>{translateText(["description"])}</p>
          <div className="flex flex-row justify-end gap-3 mt-6">
            <ButtonV2
              variant="tertiary"
              onClick={onLeave}
              aria-label={translateText(["aria", "leaveWithoutSavingBtn"])}
              icon={<Icon name={IconName.CLOSE_ICON} />}
              iconPosition="end"
            >
              {translateText(["leaveWithoutSavingBtn"])}
            </ButtonV2>
            <ButtonV2
              variant="primary"
              onClick={onStay}
              aria-label={translateText(["aria", "stayOnPageBtn"])}
              icon={<Icon name={IconName.RIGHT_ARROW_ICON} />}
              iconPosition="end"
            >
              {translateText(["stayOnPageBtn"])}
            </ButtonV2>
          </div>
        </div>
      }
    />
  );
};

export default UnsavedConfigChangesModal;
