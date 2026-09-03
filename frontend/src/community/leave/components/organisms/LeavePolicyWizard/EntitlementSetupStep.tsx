import { Dropdown, InputField } from "@rootcodelabs/skapp-ui";
import { FormikErrors, FormikTouched } from "formik";
import { DateTime } from "luxon";
import { ChangeEvent, FC, useState } from "react";

import InputDate from "~community/common/components/molecules/InputDate/InputDate";
import { FULL_MONTH_DATE_FORMAT } from "~community/common/constants/timeConstants";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  AccrualFrequency,
  AccrualTiming,
  FirstAccrualType,
  LeavePolicyFormData
} from "~community/leave/types/LeavePolicyTypes";
import {
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

  const accrualFrequencyOptions = [
    {
      id: "daily",
      label: translateOptions(["accrualFrequency", "daily"]),
      value: AccrualFrequency.DAILY
    },
    {
      id: "weekly",
      label: translateOptions(["accrualFrequency", "weekly"]),
      value: AccrualFrequency.WEEKLY
    },
    {
      id: "every-other-week",
      label: translateOptions(["accrualFrequency", "everyOtherWeek"]),
      value: AccrualFrequency.EVERY_OTHER_WEEK
    },
    {
      id: "twice-a-month",
      label: translateOptions(["accrualFrequency", "twiceAMonth"]),
      value: AccrualFrequency.TWICE_A_MONTH
    },
    {
      id: "monthly",
      label: translateOptions(["accrualFrequency", "monthly"]),
      value: AccrualFrequency.MONTHLY
    },
    {
      id: "quarterly",
      label: translateOptions(["accrualFrequency", "quarterly"]),
      value: AccrualFrequency.QUARTERLY
    },
    {
      id: "twice-a-year",
      label: translateOptions(["accrualFrequency", "twiceAYear"]),
      value: AccrualFrequency.TWICE_A_YEAR
    },
    {
      id: "yearly",
      label: translateOptions(["accrualFrequency", "yearly"]),
      value: AccrualFrequency.YEARLY
    },
    {
      id: "on-anniversary",
      label: translateOptions(["accrualFrequency", "onAnniversary"]),
      value: AccrualFrequency.ON_ANNIVERSARY
    }
  ];

  const firstAccrualOptions = [
    {
      id: "prorated",
      label: translateOptions(["firstAccrual", "prorated"]),
      value: FirstAccrualType.PRORATED
    },
    {
      id: "full",
      label: translateOptions(["firstAccrual", "full"]),
      value: FirstAccrualType.FULL
    }
  ];

  const receiveAccruedTimeOptions = [
    {
      id: "start-of-period",
      label: translateOptions(["receiveAccruedTime", "startOfPeriod"]),
      value: AccrualTiming.PERIOD_START
    },
    {
      id: "end-of-period",
      label: translateOptions(["receiveAccruedTime", "endOfPeriod"]),
      value: AccrualTiming.PERIOD_END
    }
  ];

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
              className="rounded-lg"
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
                  inputFormat={FULL_MONTH_DATE_FORMAT}
                  isYearHidden
                  selectedDate={carryoverExpiryDate}
                  setSelectedDate={setCarryoverExpiryDate}
                  initialMonthlyView={
                    carryoverExpiryDate ?? getCarryoverExpiryReferenceDate()
                  }
                  onchange={handleCarryoverExpiryDateChange}
                  labelStyles={{ fontWeight: 500 }}
                  componentStyle={{ mt: "0rem" }}
                />
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <InputField
                  label={translateText(["maxCarryOverDaysLabel"])}
                  name="maxCarryOverDays"
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
          <Dropdown
            id="leave-policy-first-accrual"
            label={translateText(["firstAccrualLabel"])}
            value={formData.firstAccrual}
            options={firstAccrualOptions}
            onChange={(value: string) => onChange({ firstAccrual: value })}
            width="50%"
            className="rounded-lg"
          />
          <Dropdown
            id="leave-policy-receive-accrued-time"
            label={translateText(["receiveAccruedTimeLabel"])}
            value={formData.receiveAccruedTime}
            options={receiveAccruedTimeOptions}
            onChange={(value: string) =>
              onChange({ receiveAccruedTime: value })
            }
            width="50%"
            className="rounded-lg"
          />
        </div>
      </WizardSection>
    </div>
  );
};

export default EntitlementSetupStep;
