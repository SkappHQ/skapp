import {
  CalendarIcon,
  Dropdown,
  InputField,
  RotateIcon
} from "@rootcodelabs/skapp-ui";
import { ChangeEvent, JSX, ReactNode } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { getEmoji } from "~community/common/utils/commonUtil";
import { useGetPolicyLeaveTypes } from "~community/leave/api/LeavePolicyApi";
import {
  PolicyType,
  LeavePolicyFormData,
  LeavePolicyWizardErrors
} from "~community/leave/types/LeavePolicyTypes";

import WizardSection from "./WizardSection";

interface Props {
  formData: LeavePolicyFormData;
  onChange: (values: Partial<LeavePolicyFormData>) => void;
  errors: LeavePolicyWizardErrors;
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
    className={`flex flex-1 cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
      selected
        ? "border-primary-accent bg-primary-background"
        : "border-secondary-accent bg-white hover:border-border-surface-secondary"
    }`}
  >
    <span
      aria-hidden="true"
      className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-primary-accent"
    >
      {selected && <span className="size-3 rounded-full bg-primary-accent" />}
    </span>
    <span className="flex flex-col gap-2">
      <span
        className={`subtitle2 flex items-center gap-2 ${
          selected ? "text-primary-text" : "text-secondary-text"
        }`}
      >
        {icon}
        {title}
      </span>
      <span
        className={`body2 ${selected ? "text-primary-text" : "text-secondary-text"}`}
      >
        {description}
      </span>
    </span>
  </button>
);

const FieldError = ({
  message
}: {
  message: string | undefined;
}): JSX.Element | null =>
  message ? (
    <p role="alert" className="body2 text-semantic-red-text">
      {message}
    </p>
  ) : null;

const BasicInfoStep = ({ formData, onChange, errors }: Props): JSX.Element => {
  const translateText = useTranslator(
    "leaveModule",
    "leavePolicies",
    "createPolicy",
    "basicInfo"
  );

  const translateCommonText = useTranslator(
    "leaveModule",
    "leavePolicies",
    "createPolicy"
  );

  const { data: policyLeaveTypes = [], isLoading } = useGetPolicyLeaveTypes();

  const leaveTypeOptions = policyLeaveTypes.map((leaveType) => ({
    id: String(leaveType.typeId),
    label: leaveType.emojiCode
      ? `${getEmoji(leaveType.emojiCode)} ${leaveType.name}`
      : leaveType.name,
    value: String(leaveType.typeId)
  }));

  return (
    <div className="flex flex-1 flex-col gap-8">
      <WizardSection title={translateText(["policyTypeTitle"])}>
        <div
          role="radiogroup"
          aria-label={translateText(["policyTypeTitle"])}
          className="flex w-full flex-col gap-3 md:flex-row"
        >
          <PolicyTypeCard
            icon={<RotateIcon className="size-6" />}
            title={translateText(["accrualTitle"])}
            description={translateText(["accrualDescription"])}
            selected={
              formData.policyType === PolicyType.ACCRUAL
            }
            onClick={() =>
              onChange({
                policyType: PolicyType.ACCRUAL
              })
            }
          />
          <PolicyTypeCard
            icon={<CalendarIcon className="size-6" />}
            title={translateText(["fixedTitle"])}
            description={translateText(["fixedDescription"])}
            selected={
              formData.policyType === PolicyType.FIXED
            }
            onClick={() =>
              onChange({
                policyType: PolicyType.FIXED
              })
            }
          />
        </div>
        <FieldError message={errors.policyType} />
      </WizardSection>

      <WizardSection title={translateText(["basicDetailsTitle"])}>
        <div className="flex max-w-3xl flex-col gap-4">
          <InputField
            label={translateText(["policyNameLabel"])}
            name="policyName"
            type="text"
            value={formData.policyName}
            placeholder={translateText(["policyNamePlaceholder"])}
            errorMessage={errors.policyName}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onChange({ policyName: event.target.value })
            }
            fullWidth
          />
          <div className="flex flex-col gap-1.5">
            <Dropdown
              id="leave-policy-leave-type"
              label={translateText(["leaveTypeLabel"])}
              value={formData.leaveType}
              placeholder={translateText(["leaveTypePlaceholder"])}
              options={leaveTypeOptions}
              onChange={(value: string, option?: { label?: ReactNode }) =>
                onChange({
                  leaveType: value,
                  leaveTypeName:
                    typeof option?.label === "string" ? option.label : value
                })
              }
              width="100%"
            />
            <FieldError message={errors.leaveType} />
            {!isLoading && leaveTypeOptions.length === 0 && (
              <p role="alert" className="body2 text-semantic-amber-text">
                {translateCommonText(["noLeaveTypesWarning"])}
              </p>
            )}
          </div>
        </div>
      </WizardSection>
    </div>
  );
};

export default BasicInfoStep;
