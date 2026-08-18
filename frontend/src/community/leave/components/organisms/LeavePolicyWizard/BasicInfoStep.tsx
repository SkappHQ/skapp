import { Dropdown, InputField } from "@rootcodelabs/skapp-ui";
import { FormikErrors, FormikTouched } from "formik";
import { ChangeEvent, FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { getEmoji } from "~community/common/utils/commonUtil";
import { useGetPolicyLeaveTypes } from "~community/leave/api/PolicyLeaveTypeApi";
import { UNPAGINATED_SIZE } from "~community/leave/constants/policyLeaveTypeConstants";
import { LeavePolicyFormData } from "~community/leave/types/LeavePolicyTypes";

import WizardSection from "./WizardSection";

interface Props {
  formData: LeavePolicyFormData;
  onChange: (values: Partial<LeavePolicyFormData>) => void;
  errors: FormikErrors<LeavePolicyFormData>;
  touched: FormikTouched<LeavePolicyFormData>;
}

const BasicInfoStep: FC<Props> = ({ formData, onChange, errors, touched }) => {
  const translateText = useTranslator(
    "leaveModule",
    "leavePolicies",
    "createPolicy"
  );

  const { data: policyLeaveTypes, isLoading } = useGetPolicyLeaveTypes({
    isActive: true,
    page: 0,
    size: UNPAGINATED_SIZE
  });

  const leaveTypeOptions = (policyLeaveTypes?.items ?? []).map((leaveType) => ({
    id: String(leaveType.id),
    label: leaveType.emojiCode
      ? `${getEmoji(leaveType.emojiCode)} ${leaveType.name}`
      : leaveType.name,
    value: String(leaveType.id)
  }));

  const policyNameError = touched.policyName ? errors.policyName : undefined;
  const leaveTypeError = touched.leaveType ? errors.leaveType : undefined;

  const handleLeaveTypeChange = (value: string): void => {
    onChange({
      leaveType: value,
      leaveTypeName:
        leaveTypeOptions.find((option) => option.value === value)?.label ??
        value
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-8">
      <WizardSection title={translateText(["basicInfo", "basicDetailsTitle"])}>
        <div className="flex max-w-3xl flex-col gap-4">
          <InputField
            label={translateText(["basicInfo", "policyNameLabel"])}
            name="policyName"
            type="text"
            value={formData.policyName}
            placeholder={translateText(["basicInfo", "policyNamePlaceholder"])}
            state={policyNameError ? "error" : "default"}
            errorMessage={policyNameError}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onChange({ policyName: event.target.value })
            }
            fullWidth
          />
          <div className="flex flex-col gap-1.5">
            <Dropdown
              id="leave-policy-leave-type"
              label={translateText(["basicInfo", "leaveTypeLabel"])}
              value={formData.leaveType}
              placeholder={translateText(["basicInfo", "leaveTypePlaceholder"])}
              options={leaveTypeOptions}
              variant={leaveTypeError ? "primary-error" : "primary"}
              errorMessage={leaveTypeError}
              onChange={handleLeaveTypeChange}
              width="100%"
              className="rounded-lg"
            />
            {!isLoading && leaveTypeOptions.length === 0 && (
              <p role="alert" className="body2 text-semantic-amber-text">
                {translateText(["noLeaveTypesWarning"])}
              </p>
            )}
          </div>
        </div>
      </WizardSection>
    </div>
  );
};

export default BasicInfoStep;
