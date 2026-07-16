import { CalendarIcon, Card, LargeModal, RotateIcon } from "@rootcodelabs/skapp-ui";
import { JSX, KeyboardEvent, ReactNode } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { PolicyType } from "~community/leave/types/LeavePolicyTypes";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (policyType: PolicyType) => void;
}

interface PolicyTypeCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  onSelect: () => void;
}

const PolicyTypeCard = ({
  icon,
  title,
  description,
  onSelect
}: PolicyTypeCardProps): JSX.Element => (
  <Card
    role="button"
    aria-label={title}
    onClick={onSelect}
    onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onSelect();
      }
    }}
    className="flex-1 cursor-pointer"
  >
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <span className="text-primary-accent" aria-hidden="true">
        {icon}
      </span>
      <span className="flex flex-col gap-2">
        <span className="subtitle2 text-black">{title}</span>
        <span className="body2 text-secondary-text">{description}</span>
      </span>
    </div>
  </Card>
);

const PolicyTypeSelectionModal = ({
  isOpen,
  onClose,
  onSelect
}: Props): JSX.Element => {
  const translateText = useTranslator(
    "leaveModule",
    "leavePolicies",
    "createPolicy"
  );

  return (
    <LargeModal
      id="policy-type-selection-modal"
      isOpen={isOpen}
      onClose={onClose}
      modalHeader={translateText(["basicInfo", "policyTypeTitle"])}
      backdropVariant="dark"
      className="relative w-[90vw] max-w-240 overflow-hidden"
      closeButtonAriaLabel={translateText(["closeBtnAriaLabel"])}
      content={
        <div className="flex flex-col gap-4 pt-2 md:flex-row">
          <PolicyTypeCard
            icon={<RotateIcon className="size-8" />}
            title={translateText(["basicInfo", "accrualTitle"])}
            description={translateText(["basicInfo", "accrualDescription"])}
            onSelect={() => onSelect(PolicyType.ACCRUAL)}
          />
          <PolicyTypeCard
            icon={<CalendarIcon className="size-8" />}
            title={translateText(["basicInfo", "flexibleTitle"])}
            description={translateText(["basicInfo", "flexibleDescription"])}
            onSelect={() => onSelect(PolicyType.FLEXIBLE)}
          />
        </div>
      }
    />
  );
};

export default PolicyTypeSelectionModal;
