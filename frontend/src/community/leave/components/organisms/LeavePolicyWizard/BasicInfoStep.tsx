import {
  CalendarIcon,
  Dropdown,
  InputField,
  RadioButton,
  RotateIcon
} from "@rootcodelabs/skapp-ui";
import { ChangeEvent, JSX, ReactNode } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { leaveTypeItemList } from "~community/leave/constants/leavePolicyConstants";
import {
  LeavePolicyEntitlementType,
  LeavePolicyFormData
} from "~community/leave/types/LeavePolicyTypes";

import WizardSection from "./WizardSection";

interface Props {
  formData: LeavePolicyFormData;
  onChange: (values: Partial<LeavePolicyFormData>) => void;
}

interface PolicyTypeCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}

const PolicyTypeCard = ({
  icon,
  title,
  description,
  selected,
  onClick
}: PolicyTypeCardProps): JSX.Element => (
  <button
    type="button"
    role="radio"
    aria-checked={selected}
    onClick={onClick}
    className={`flex flex-1 cursor-pointer items-start gap-3 rounded-xl border p-5 text-left transition-colors ${
      selected
        ? "border-blue-500 bg-blue-50"
        : "border-gray-200 bg-gray-50 hover:border-gray-300"
    }`}
  >
    <RadioButton isSelected={selected} className="mt-0.5 shrink-0" />
    <span className="flex flex-col gap-1.5">
      <span className="flex items-center gap-2 text-base font-semibold text-gray-900">
        {icon}
        {title}
      </span>
      <span className="text-sm text-gray-600">{description}</span>
    </span>
  </button>
);

const BasicInfoStep = ({ formData, onChange }: Props): JSX.Element => {
  const translateText = useTranslator(
    "leaveModule",
    "leavePolicies",
    "createPolicy",
    "basicInfo"
  );

  return (
    <div className="flex flex-1 flex-col gap-8">
      <WizardSection title={translateText(["policyTypeTitle"])}>
        <div
          role="radiogroup"
          aria-label={translateText(["policyTypeTitle"])}
          className="flex w-full flex-col gap-6 md:flex-row"
        >
          <PolicyTypeCard
            icon={<RotateIcon className="size-5 text-gray-700" />}
            title={translateText(["accrualTitle"])}
            description={translateText(["accrualDescription"])}
            selected={
              formData.entitlementType === LeavePolicyEntitlementType.ACCRUAL
            }
            onClick={() =>
              onChange({
                entitlementType: LeavePolicyEntitlementType.ACCRUAL
              })
            }
          />
          <PolicyTypeCard
            icon={<CalendarIcon className="size-5 text-gray-700" />}
            title={translateText(["fixedTitle"])}
            description={translateText(["fixedDescription"])}
            selected={
              formData.entitlementType === LeavePolicyEntitlementType.FIXED
            }
            onClick={() =>
              onChange({
                entitlementType: LeavePolicyEntitlementType.FIXED
              })
            }
          />
        </div>
      </WizardSection>

      <WizardSection title={translateText(["basicDetailsTitle"])}>
        <div className="flex max-w-3xl flex-col gap-4">
          <InputField
            label={translateText(["policyNameLabel"])}
            name="policyName"
            type="text"
            value={formData.policyName}
            placeholder={translateText(["policyNamePlaceholder"])}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onChange({ policyName: event.target.value })
            }
            fullWidth
          />
          <Dropdown
            id="leave-policy-leave-type"
            label={translateText(["leaveTypeLabel"])}
            value={formData.leaveType}
            placeholder={translateText(["leaveTypePlaceholder"])}
            options={leaveTypeItemList}
            onChange={(value: string) => onChange({ leaveType: value })}
            width="100%"
          />
        </div>
      </WizardSection>
    </div>
  );
};

export default BasicInfoStep;
