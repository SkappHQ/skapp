import { Dropdown, InputField } from "@rootcodelabs/skapp-ui";
import { ChangeEvent, JSX, ReactNode } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { getEmoji } from "~community/common/utils/commonUtil";
import { useGetPolicyLeaveTypes } from "~community/leave/api/LeavePolicyApi";
import {
  LeavePolicyFormData,
  LeavePolicyWizardErrors
} from "~community/leave/types/LeavePolicyTypes";

import WizardSection from "./WizardSection";

interface Props {
  formData: LeavePolicyFormData;
  onChange: (values: Partial<LeavePolicyFormData>) => void;
  errors: LeavePolicyWizardErrors;
}

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
