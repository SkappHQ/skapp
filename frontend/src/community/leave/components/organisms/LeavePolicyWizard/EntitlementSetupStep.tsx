import { Dropdown, InputField } from "@rootcodelabs/skapp-ui";
import { FormikErrors, FormikTouched } from "formik";
import { DateTime } from "luxon";
import { ChangeEvent, FC, useState } from "react";

import InputDate from "~community/common/components/molecules/InputDate/InputDate";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  CARRYOVER_EXPIRY_DISPLAY_FORMAT,
  accrualFrequencyItemList,
  firstAccrualItemList,
  receiveAccruedTimeItemList
} from "~community/leave/constants/leavePolicyConstants";
import { LeavePolicyFormData } from "~community/leave/types/LeavePolicyTypes";
import {
  buildTranslatedOptionList,
  getCarryoverExpiryReferenceDate,
  parseCarryoverExpiryDate,
  toCarryoverExpiryMonthDay
} from "~community/leave/utils/leavePolicy/leavePolicyUtils";

import RadioGroup from "./RadioGroup";
import WizardSection from "./WizardSection";

interface Props {
  formData: LeavePolicyFormData;
  onChange: (values: Partial<LeavePolicyFormData>) => void;
  errors: FormikErrors<LeavePolicyFormData>;
  touched: FormikTouched<LeavePolicyFormData>;
}

const EntitlementSetupStep: FC<Props> = ({
  formData,
  onChange,
  errors,
  touched
}) => {
  const translateText = useTranslator(
    "leaveModule",
    "leavePolicies",
    "createPolicy",
    "entitlementSetup"
  );

  const translateOptions = useTranslator(
    "leaveModule",
    "leavePolicies",
    "createPolicy",
    "options"
  );

  const [carryoverExpiryDate, setCarryoverExpiryDate] = useState<
    DateTime | undefined
  >(() => parseCarryoverExpiryDate(formData.carryoverExpiryDate));

  const handleCarryOverChange = (value: boolean) => {
    if (!value) {
      setCarryoverExpiryDate(undefined);
    }
    onChange({
      canCarryOver: value,
      ...(value ? {} : { carryoverExpiryDate: "", maxCarryOverDays: "" })
    });
  };

  const handleCarryoverExpiryDateChange = (newValue: string) => {
    onChange({
      carryoverExpiryDate: toCarryoverExpiryMonthDay(newValue)
    });
  };

  const accrualFrequencyOptions = buildTranslatedOptionList(
    accrualFrequencyItemList,
    "accrualFrequency",
    translateOptions
  );
  const firstAccrualOptions = buildTranslatedOptionList(
    firstAccrualItemList,
    "firstAccrual",
    translateOptions
  );
  const receiveAccruedTimeOptions = buildTranslatedOptionList(
    receiveAccruedTimeItemList,
    "receiveAccruedTime",
    translateOptions
  );

  return (
    <div className="flex flex-1 flex-col gap-8">
      <WizardSection title={translateText(["accrualScheduleTitle"])}>
        <div className="flex max-w-3xl flex-col gap-4 md:flex-row">
          <div className="flex flex-1 flex-col gap-1.5">
            <InputField
              label={translateText(["employeesAccrueLabel"])}
              name="accrualDays"
              value={formData.accrualDays}
              placeholder={translateText(["employeesAccruePlaceholder"])}
              state={
                touched.accrualDays && errors.accrualDays ? "error" : "default"
              }
              errorMessage={
                touched.accrualDays ? errors.accrualDays : undefined
              }
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
              options={accrualFrequencyOptions}
              variant={
                touched.accrualFrequency && errors.accrualFrequency
                  ? "primary-error"
                  : "primary"
              }
              errorMessage={
                touched.accrualFrequency ? errors.accrualFrequency : undefined
              }
              onChange={(value: string) =>
                onChange({ accrualFrequency: value })
              }
              width="100%"
            />
          </div>
        </div>
      </WizardSection>

      <WizardSection title={translateText(["accrualOptionsTitle"])}>
        <div className="flex max-w-3xl flex-col gap-4">
          <RadioGroup
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
                state={
                  touched.waitingPeriodDays && errors.waitingPeriodDays
                    ? "error"
                    : "default"
                }
                errorMessage={
                  touched.waitingPeriodDays
                    ? errors.waitingPeriodDays
                    : undefined
                }
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  onChange({ waitingPeriodDays: event.target.value })
                }
                fullWidth
              />
            </div>
          )}
          <RadioGroup
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
                state={
                  touched.accrualCapDays && errors.accrualCapDays
                    ? "error"
                    : "default"
                }
                errorMessage={
                  touched.accrualCapDays ? errors.accrualCapDays : undefined
                }
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  onChange({ accrualCapDays: event.target.value })
                }
                fullWidth
              />
            </div>
          )}
          <RadioGroup
            label={translateText(["carryOverLabel"])}
            name="canCarryOver"
            noLabel={translateText(["carryOverNo"])}
            yesLabel={translateText(["carryOverYes"])}
            value={formData.canCarryOver}
            onChange={handleCarryOverChange}
          />
          {formData.canCarryOver && (
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex flex-1 flex-col gap-1.5">
                <InputDate
                  label={translateText(["carryoverExpiryDateLabel"])}
                  placeholder={translateText([
                    "carryoverExpiryDatePlaceholder"
                  ])}
                  tooltip={translateText(["carryoverExpiryDateTooltip"])}
                  inputFormat={CARRYOVER_EXPIRY_DISPLAY_FORMAT}
                  isYearHidden
                  selectedDate={carryoverExpiryDate}
                  setSelectedDate={setCarryoverExpiryDate}
                  initialMonthlyView={
                    carryoverExpiryDate ?? getCarryoverExpiryReferenceDate()
                  }
                  onchange={handleCarryoverExpiryDateChange}
                  componentStyle={{ mt: "0rem" }}
                />
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <InputField
                  label={translateText(["maxCarryOverDaysLabel"])}
                  name="maxCarryOverDays"
                  type="number"
                  value={formData.maxCarryOverDays}
                  placeholder={translateText(["maxCarryOverDaysPlaceholder"])}
                  state={
                    touched.maxCarryOverDays && errors.maxCarryOverDays
                      ? "error"
                      : "default"
                  }
                  errorMessage={
                    touched.maxCarryOverDays
                      ? errors.maxCarryOverDays
                      : undefined
                  }
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    onChange({ maxCarryOverDays: event.target.value })
                  }
                  fullWidth
                />
              </div>
            </div>
          )}
        </div>
      </WizardSection>

      <WizardSection title={translateText(["fineTuningTitle"])}>
        <div className="flex max-w-3xl flex-col gap-4">
          <Dropdown
            id="leave-policy-first-accrual"
            label={translateText(["firstAccrualLabel"])}
            value={formData.firstAccrual}
            options={firstAccrualOptions}
            onChange={(value: string) => onChange({ firstAccrual: value })}
            width="100%"
          />
          <Dropdown
            id="leave-policy-receive-accrued-time"
            label={translateText(["receiveAccruedTimeLabel"])}
            value={formData.receiveAccruedTime}
            options={receiveAccruedTimeOptions}
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
