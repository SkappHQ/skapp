import { CircleMinusIcon, CloseIcon, SmallModal } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";

interface Props {
  isOpen: boolean;
  isEnabling: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const EnableMultiLevelApprovalConfirmModal: FC<Props> = ({
  isOpen,
  isEnabling,
  onClose,
  onConfirm
}) => {
  const translateText = useTranslator(
    "configurations",
    "leave",
    "leaveApprovalSection",
    "enableConfirmModal"
  );

  return (
    <SmallModal
      isOpen={isOpen}
      onClose={onClose}
      modalHeader={translateText(["title"])}
      content={
        <div className="body1 text-black">
          <p>{translateText(["consequencesTitle"])}</p>
          <ul className="list-disc pl-6">
            <li>{translateText(["consequenceAuthorizerField"])}</li>
            <li>{translateText(["consequenceApprovalOrder"])}</li>
            <li>{translateText(["consequenceOtherSupervisorsRemoved"])}</li>
          </ul>
        </div>
      }
      buttons={{
        buttonLeft: {
          variant: "tertiary",
          onClick: onClose,
          disabled: isEnabling,
          icon: <CloseIcon />,
          iconPosition: "end",
          children: translateText(["cancelButton"])
        },
        buttonRight: {
          variant: "error",
          onClick: onConfirm,
          disabled: isEnabling,
          isLoading: isEnabling,
          icon: <CircleMinusIcon />,
          iconPosition: "end",
          children: translateText(["confirmButton"])
        }
      }}
    />
  );
};

export default EnableMultiLevelApprovalConfirmModal;
