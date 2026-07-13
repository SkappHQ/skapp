import { InputField, Toggle } from "@rootcodelabs/skapp-ui";
import { ChangeEvent, JSX } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  LeavePolicyFormData,
  LeavePolicyWizardErrors
} from "~community/leave/types/LeavePolicyTypes";

import WizardDateInput from "./WizardDateInput";
import WizardSection from "./WizardSection";

interface Props {
  formData: LeavePolicyFormData;
  onChange: (values: Partial<LeavePolicyFormData>) => void;
  errors: LeavePolicyWizardErrors;
}

const CarryForwardStep = ({
  formData,
  onChange,
  errors
}: Props): JSX.Element => {
  const translateText = useTranslator(
    "leaveModule",
    "leavePolicies",
    "createPolicy",
    "carryForward"
  );

  return (
    <div className="flex flex-1 flex-col gap-8">
      <WizardSection title={translateText(["title"])}>
        <div className="flex max-w-3xl flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="subtitle3 text-black">
              {translateText(["toggleLabel"])}
            </p>
            <Toggle
              checked={formData.isCarryForwardEnabled}
              onChange={(checked: boolean) =>
                onChange({ isCarryForwardEnabled: checked })
              }
              ariaLabel={translateText(["toggleLabel"])}
            />
          </div>
          <InputField
            label={translateText(["maxDaysLabel"])}
            name="maxCarryForwardDays"
            type="number"
            value={formData.maxCarryForwardDays}
            placeholder={translateText(["maxDaysPlaceholder"])}
            disabled={!formData.isCarryForwardEnabled}
            errorMessage={errors.maxCarryForwardDays}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onChange({ maxCarryForwardDays: event.target.value })
            }
            fullWidth
          />
          <div className="flex flex-col gap-1.5">
            <WizardDateInput
              label={translateText(["expiryDateLabel"])}
              placeholder={translateText(["expiryDatePlaceholder"])}
              value={formData.carryForwardExpiryDate}
              onChange={(date) => onChange({ carryForwardExpiryDate: date })}
              disabled={!formData.isCarryForwardEnabled}
            />
            {errors.carryForwardExpiryDate ? (
              <p role="alert" className="body2 text-semantic-red-text">
                {errors.carryForwardExpiryDate}
              </p>
            ) : null}
          </div>
        </div>
      </WizardSection>
    </div>
  );
};

export default CarryForwardStep;
