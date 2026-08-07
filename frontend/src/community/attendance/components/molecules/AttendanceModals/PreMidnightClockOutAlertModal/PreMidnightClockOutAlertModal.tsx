import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";

interface Props {
  closeModal: () => void;
}

const PreMidnightClockOutAlertModal: FC<Props> = ({ closeModal }) => {
  const translateText = useTranslator("attendanceModule", "timeWidget");

  const handleOkay = (): void => {
    closeModal();
  };

  return (
    <div>
      <p className="body2 pb-4">{translateText(["clockOutAlertMessage"])}</p>
      <div className="flex justify-end gap-2 mt-4">
        <ButtonV2
          onClick={handleOkay}
          aria-label={translateText(["ok"])}
          icon={<Icon name={IconName.CHECK_ICON} />}
          iconPosition="end"
        >
          {translateText(["ok"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default PreMidnightClockOutAlertModal;
