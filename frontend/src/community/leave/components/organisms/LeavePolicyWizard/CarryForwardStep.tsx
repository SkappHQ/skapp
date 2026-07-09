import { InputField, Toggle } from "@rootcodelabs/skapp-ui";
import { ChangeEvent, JSX } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { LeavePolicyFormData } from "~community/leave/types/LeavePolicyTypes";

import WizardDateInput from "./WizardDateInput";
import WizardSection from "./WizardSection";

interface Props {
  formData: LeavePolicyFormData;
  onChange: (values: Partial<LeavePolicyFormData>) => void;
}

const CarryForwardStep = ({ formData, onChange }: Props): JSX.Element => {
  const translateText = useTranslator(
    "leaveModule",
    "leavePolicies",
    "createPolicy",
    "carryForward"
  );

  return (
    <div className="flex flex-1 flex-col gap-8">
      <WizardSection title={translateText(["title"])}>
        <div className="flex max-w-3xl flex-col gap-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">
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
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onChange({ maxCarryForwardDays: event.target.value })
            }
            fullWidth
          />
          <WizardDateInput
            label={translateText(["expiryDateLabel"])}
            placeholder={translateText(["expiryDatePlaceholder"])}
            value={formData.carryForwardExpiryDate}
            onChange={(date) => onChange({ carryForwardExpiryDate: date })}
            disabled={!formData.isCarryForwardEnabled}
          />
        </div>
      </WizardSection>
    </div>
  );
};

export default CarryForwardStep;
