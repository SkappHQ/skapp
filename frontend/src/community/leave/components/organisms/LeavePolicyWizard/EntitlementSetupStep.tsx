import { Checkbox, Dropdown, InputField } from "@rootcodelabs/skapp-ui";
import { ChangeEvent, JSX } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  accrualFrequencyItemList,
  carryoverDateItemList,
  firstAccrualItemList,
  receiveAccruedTimeItemList
} from "~community/leave/constants/leavePolicyConstants";
import {
  LeavePolicyFormData,
  LeavePolicyWizardErrors
} from "~community/leave/types/LeavePolicyTypes";

import WizardSection from "./WizardSection";
import YesNoRadioGroup from "./YesNoRadioGroup";

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

const EntitlementSetupStep = ({
  formData,
  onChange,
  errors
}: Props): JSX.Element => {
  const translateText = useTranslator(
    "leaveModule",
    "leavePolicies",
    "createPolicy",
    "entitlementSetup"
  );

  return (
    <div className="flex flex-1 flex-col gap-8">
      <WizardSection title={translateText(["accrualScheduleTitle"])}>
        <div className="flex max-w-3xl flex-col gap-4 md:flex-row">
          <div className="flex flex-1 flex-col gap-1.5">
            <InputField
              label={translateText(["employeesAccrueLabel"])}
              name="accrualDays"
              type="number"
              value={formData.accrualDays}
              placeholder={translateText(["employeesAccruePlaceholder"])}
              errorMessage={errors.accrualDays}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onChange({ accrualDays: event.target.value })
              }
              fullWidth
            />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <Dropdown
              id="leave-policy-accrual-frequency"
              label={translateText(["frequencyLabel"])}
              value={formData.accrualFrequency}
              placeholder={translateText(["frequencyPlaceholder"])}
              options={accrualFrequencyItemList}
              onChange={(value: string) =>
                onChange({ accrualFrequency: value })
              }
              width="100%"
            />
            <FieldError message={errors.accrualFrequency} />
          </div>
        </div>
      </WizardSection>

      <WizardSection title={translateText(["accrualOptionsTitle"])}>
        <div className="flex max-w-3xl flex-col gap-4">
          <YesNoRadioGroup
            label={translateText(["waitingPeriodLabel"])}
            name="hasWaitingPeriod"
            noLabel={translateText(["waitingPeriodNo"])}
            yesLabel={translateText(["waitingPeriodYes"])}
            value={formData.hasWaitingPeriod}
            onChange={(value) =>
              onChange({
                hasWaitingPeriod: value,
                ...(value ? {} : { waitingPeriodDays: "" })
              })
            }
          />
          {formData.hasWaitingPeriod && (
            <div className="w-full md:w-64">
              <InputField
                label={translateText(["waitingPeriodDaysLabel"])}
                name="waitingPeriodDays"
                type="number"
                value={formData.waitingPeriodDays}
                placeholder={translateText(["waitingPeriodDaysPlaceholder"])}
                errorMessage={errors.waitingPeriodDays}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  onChange({ waitingPeriodDays: event.target.value })
                }
                fullWidth
              />
            </div>
          )}
          <YesNoRadioGroup
            label={translateText(["accrualCapLabel"])}
            name="hasAccrualCap"
            noLabel={translateText(["accrualCapNo"])}
            yesLabel={translateText(["accrualCapYes"])}
            value={formData.hasAccrualCap}
            onChange={(value) =>
              onChange({
                hasAccrualCap: value,
                ...(value ? {} : { accrualCapDays: "" })
              })
            }
          />
          {formData.hasAccrualCap && (
            <div className="w-full md:w-64">
              <InputField
                label={translateText(["accrualCapDaysLabel"])}
                name="accrualCapDays"
                type="number"
                value={formData.accrualCapDays}
                placeholder={translateText(["accrualCapDaysPlaceholder"])}
                errorMessage={errors.accrualCapDays}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  onChange({ accrualCapDays: event.target.value })
                }
                fullWidth
              />
            </div>
          )}
          <YesNoRadioGroup
            label={translateText(["carryOverLabel"])}
            name="canCarryOver"
            noLabel={translateText(["carryOverNo"])}
            yesLabel={translateText(["carryOverYes"])}
            value={formData.canCarryOver}
            onChange={(value) => onChange({ canCarryOver: value })}
          />
          {formData.canCarryOver && (
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex flex-1 flex-col gap-1.5">
                <Dropdown
                  id="leave-policy-carryover-date"
                  label={translateText(["carryOverDateLabel"])}
                  value={formData.carryOverDate}
                  placeholder={translateText(["carryOverDatePlaceholder"])}
                  options={carryoverDateItemList}
                  onChange={(value: string) =>
                    onChange({ carryOverDate: value })
                  }
                  width="100%"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <InputField
                  label={translateText(["maxCarryOverDaysLabel"])}
                  name="maxCarryOverDays"
                  type="number"
                  value={formData.maxCarryOverDays}
                  placeholder={translateText(["maxCarryOverDaysPlaceholder"])}
                  errorMessage={errors.maxCarryOverDays}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    onChange({ maxCarryOverDays: event.target.value })
                  }
                  fullWidth
                />
              </div>
            </div>
          )}
          {formData.canCarryOver && (
            <Checkbox
              label={translateText(["resetNegativeBalancesLabel"])}
              ariaLabel={translateText(["resetNegativeBalancesLabel"])}
              checked={formData.resetNegativeBalances}
              onChange={(checked) =>
                onChange({ resetNegativeBalances: checked })
              }
            />
          )}
        </div>
      </WizardSection>

      <WizardSection title={translateText(["fineTuningTitle"])}>
        <div className="flex max-w-3xl flex-col gap-4">
          <Dropdown
            id="leave-policy-first-accrual"
            label={translateText(["firstAccrualLabel"])}
            value={formData.firstAccrual}
            options={firstAccrualItemList}
            onChange={(value: string) => onChange({ firstAccrual: value })}
            width="100%"
          />
          <Dropdown
            id="leave-policy-receive-accrued-time"
            label={translateText(["receiveAccruedTimeLabel"])}
            value={formData.receiveAccruedTime}
            options={receiveAccruedTimeItemList}
            onChange={(value: string) =>
              onChange({ receiveAccruedTime: value })
            }
            width="100%"
          />
        </div>
      </WizardSection>
    </div>
  );
};

export default EntitlementSetupStep;
