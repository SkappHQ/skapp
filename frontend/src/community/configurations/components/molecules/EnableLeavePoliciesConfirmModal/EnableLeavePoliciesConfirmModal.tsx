import {
  CircleMinusIcon,
  CloseIcon,
  SmallModal,
  YellowWarningIcon
} from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";

interface Props {
  isOpen: boolean;
  isEnabling: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const EnableLeavePoliciesConfirmModal: FC<Props> = ({
  isOpen,
  isEnabling,
  onClose,
  onConfirm
}) => {
  const translateText = useTranslator(
    "configurations",
    "leave",
    "enableConfirmModal"
  );

  return (
    <SmallModal
      isOpen={isOpen}
      onClose={onClose}
      modalHeader={translateText(["title"])}
      content={
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-lg bg-semantic-amber-background px-4 py-3">
            <YellowWarningIcon aria-hidden="true" className="size-4 shrink-0" />
            <div>
              <p className="subtitle3 text-black">
                {translateText(["irreversibleNotice"])}
              </p>
              <p className="body2 text-black">
                {translateText(["recommendationNotice"])}
              </p>
            </div>
          </div>
          <div className="body1 text-black">
            <p>{translateText(["consequencesTitle"])}</p>
            <ul className="list-disc pl-6">
              <li>{translateText(["consequenceZeroAllocations"])}</li>
              <li>{translateText(["consequenceCancelPending"])}</li>
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
          icon: (
            <CircleMinusIcon
              fill="var(--color-semantic-red-text)"
            />
          ),
          iconPosition: "end",
          title: isEnabling ? translateText(["confirmingTooltip"]) : undefined,
          children: isEnabling
            ? translateText(["confirmingButton"])
            : translateText(["confirmButton"])
        }
      }}
    />
  );
};

export default EnableLeavePoliciesConfirmModal;
