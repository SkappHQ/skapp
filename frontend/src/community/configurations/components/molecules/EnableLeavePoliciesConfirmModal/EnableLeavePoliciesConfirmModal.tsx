import {
  CloseIcon,
  DeleteButtonIcon,
  SmallModal,
  YellowWarningIcon
} from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const EnableLeavePoliciesConfirmModal: FC<Props> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  const translateText = useTranslator(
    "configurations",
    "leave",
    "enableConfirmModal"
  );
  const translateButtonText = useTranslator("configurations", "leave", "buttons");

  return (
    <SmallModal
      isOpen={isOpen}
      onClose={onClose}
      modalHeader={translateText(["title"])}
      content={
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-lg bg-semantic-amber-background px-4 py-3">
            <YellowWarningIcon className="size-4 shrink-0" />
            <p className="body2 text-black">
              <span className="font-medium">
                {translateText(["warningTitle"])}
              </span>{" "}
              {translateText(["warningDescription"])}
            </p>
          </div>
          <div className="body1 text-black">
            <p>{translateText(["consequencesTitle"])}</p>
            <ul className="list-disc pl-6">
              <li>{translateText(["consequenceDeleteAllocations"])}</li>
              <li>{translateText(["consequenceRemoveBulkUpload"])}</li>
              <li>{translateText(["consequenceRetainRecords"])}</li>
            </ul>
          </div>
        </div>
      }
      buttons={{
        buttonLeft: {
          variant: "tertiary",
          onClick: onClose,
          icon: <CloseIcon />,
          iconPosition: "end",
          children: translateButtonText(["cancel"])
        },
        buttonRight: {
          variant: "error",
          onClick: onConfirm,
          icon: <DeleteButtonIcon fill="var(--color-semantic-red-text)" />,
          iconPosition: "end",
          children: translateText(["confirmButton"])
        }
      }}
    />
  );
};

export default EnableLeavePoliciesConfirmModal;
