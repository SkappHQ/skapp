import { ArrowLeftIcon, CloseIcon, SmallModal } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";

interface Props {
  isOpen: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
}

const CancelPolicyCreationModal: FC<Props> = ({
  isOpen,
  onDismiss,
  onConfirm
}) => {
  const translateText = useTranslator(
    "leaveModule",
    "leavePolicies",
    "createPolicy"
  );

  return (
    <SmallModal
      isOpen={isOpen}
      onClose={onDismiss}
      modalHeader={translateText(["cancelConfirmTitle"])}
      content={
        <p className="body1 text-black">
          {translateText(["cancelConfirmDescription"])}
        </p>
      }
      buttons={{
        buttonLeft: {
          variant: "tertiary",
          onClick: onDismiss,
          icon: <ArrowLeftIcon />,
          iconPosition: "start",
          children: translateText(["cancelDismissBtnTxt"])
        },
        buttonRight: {
          variant: "error",
          onClick: onConfirm,
          icon: <CloseIcon />,
          iconPosition: "end",
          children: translateText(["cancelConfirmBtnTxt"])
        }
      }}
    />
  );
};

export default CancelPolicyCreationModal;
