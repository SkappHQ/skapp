import { Checkbox, Dropdown, InputField } from "@rootcodelabs/skapp-ui";
import { ChangeEvent, JSX } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  accrualFrequencyItemList,
  firstAccrualItemList,
  receiveAccruedTimeItemList,
  resetDateItemList
} from "~community/leave/constants/leavePolicyConstants";
import {
  LeavePolicyEntitlementType,
  LeavePolicyFormData
} from "~community/leave/types/LeavePolicyTypes";

import WizardDateInput from "./WizardDateInput";
import WizardSection from "./WizardSection";
import YesNoRadioGroup from "./YesNoRadioGroup";

interface Props {
  formData: LeavePolicyFormData;
  onChange: (values: Partial<LeavePolicyFormData>) => void;
}

const EntitlementSetupStep = ({ formData, onChange }: Props): JSX.Element => {
  const translateText = useTranslator(
    "leaveModule",
    "leavePolicies",
    "createPolicy",
    "entitlementSetup"
  );

  if (formData.entitlementType === LeavePolicyEntitlementType.FIXED) {
    return (
      <div className="flex flex-1 flex-col gap-8">
        <WizardSection title={translateText(["allocationTitle"])}>
          <div className="max-w-3xl">
            <InputField
              label={translateText(["totalDaysAllocatedLabel"])}
              name="totalDaysAllocated"
              type="number"
              value={formData.totalDaysAllocated}
              placeholder={translateText(["totalDaysAllocatedPlaceholder"])}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onChange({ totalDaysAllocated: event.target.value })
              }
              fullWidth
            />
          </div>
        </WizardSection>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-8">
      <WizardSection title={translateText(["accrualScheduleTitle"])}>
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="w-full md:w-64">
            <InputField
              label={translateText(["employeesAccrueLabel"])}
              name="accrualDays"
              type="number"
              value={formData.accrualDays}
              placeholder={translateText(["employeesAccruePlaceholder"])}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onChange({ accrualDays: event.target.value })
              }
              fullWidth
            />
          </div>
          <div className="w-full md:w-64">
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
          </div>
          <div className="w-full md:w-64">
            <Dropdown
              id="leave-policy-reset-date"
              label={translateText(["resetDateLabel"])}
              value={formData.resetDate}
              placeholder={translateText(["resetDatePlaceholder"])}
              options={resetDateItemList}
              onChange={(value: string) => onChange({ resetDate: value })}
              width="100%"
            />
          </div>
        </div>
      </WizardSection>

      <WizardSection title={translateText(["accrualOptionsTitle"])}>
        <div className="flex max-w-3xl flex-col gap-5">
          <YesNoRadioGroup
            label={translateText(["waitingPeriodLabel"])}
            name="hasWaitingPeriod"
            noLabel={translateText(["waitingPeriodNo"])}
            yesLabel={translateText(["waitingPeriodYes"])}
            value={formData.hasWaitingPeriod}
            onChange={(value) => onChange({ hasWaitingPeriod: value })}
          />
          <YesNoRadioGroup
            label={translateText(["accrualCapLabel"])}
            name="hasAccrualCap"
            noLabel={translateText(["accrualCapNo"])}
            yesLabel={translateText(["accrualCapYes"])}
            value={formData.hasAccrualCap}
            onChange={(value) => onChange({ hasAccrualCap: value })}
          />
          <YesNoRadioGroup
            label={translateText(["carryOverLabel"])}
            name="canCarryOver"
            noLabel={translateText(["carryOverNo"])}
            yesLabel={translateText(["carryOverYes"])}
            value={formData.canCarryOver}
            onChange={(value) => onChange({ canCarryOver: value })}
          />
          {formData.canCarryOver && (
            <>
              <WizardDateInput
                label={translateText(["carryOverDateLabel"])}
                placeholder={translateText(["carryOverDatePlaceholder"])}
                value={formData.carryOverDate}
                onChange={(date) => onChange({ carryOverDate: date })}
              />
              <Checkbox
                id="reset-negative-balances"
                checked={formData.resetNegativeBalances}
                label={translateText(["resetNegativeBalancesLabel"])}
                onChange={(checked: boolean) =>
                  onChange({ resetNegativeBalances: checked })
                }
              />
            </>
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
