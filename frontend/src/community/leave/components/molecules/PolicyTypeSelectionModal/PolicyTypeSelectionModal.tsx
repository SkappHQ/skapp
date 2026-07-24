import { CalendarIcon, LargeModal, RefreshIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { PolicyType } from "~community/leave/types/LeavePolicyTypes";

import PolicyTypeCard from "./PolicyTypeCard";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (policyType: PolicyType) => void;
}

const PolicyTypeSelectionModal: FC<Props> = ({ isOpen, onClose, onSelect }) => {
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
        <div className="flex flex-col gap-4 pt-2 md:flex-row md:gap-8">
          <PolicyTypeCard
            icon={<RefreshIcon className="size-16" />}
            title={translateText(["basicInfo", "accrualTitle"])}
            description={translateText(["basicInfo", "accrualDescription"])}
            onSelect={() => onSelect(PolicyType.ACCRUAL)}
          />
          <PolicyTypeCard
            icon={<CalendarIcon className="size-16"/>}
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
