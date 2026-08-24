import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import LeavePolicyStatusBadge from "~community/leave/components/molecules/LeavePolicyStatusBadge/LeavePolicyStatusBadge";
import {
  accrualFrequencyItemList,
  firstAccrualItemList,
  receiveAccruedTimeItemList
} from "~community/leave/constants/leavePolicyConstants";
import {
  LeavePolicyFormData,
  LeavePolicyWizardSteps
} from "~community/leave/types/LeavePolicyTypes";
import {
  buildTranslatedOptionList,
  formatCarryoverExpiryDate
} from "~community/leave/utils/leavePolicy/leavePolicyUtils";

import SummaryCard from "./SummaryCard";
import SummaryItem from "./SummaryItem";

interface Props {
  formData: LeavePolicyFormData;
  onEdit: (step: LeavePolicyWizardSteps) => void;
}

interface SummaryOption {
  label: string;
  value: string;
}

const getOptionLabel = (options: SummaryOption[], value: string): string =>
  options.find((option) => option.value === value)?.label ?? "-";

const SummaryStep: FC<Props> = ({ formData, onEdit }) => {
  const translateText = useTranslator(
    "leaveModule",
    "leavePolicies",
    "createPolicy"
  );

  const accrualFrequencyOptions = buildTranslatedOptionList(
    accrualFrequencyItemList,
    "accrualFrequency",
    (suffixes) => translateText(["options", ...suffixes])
  );
  const firstAccrualOptions = buildTranslatedOptionList(
    firstAccrualItemList,
    "firstAccrual",
    (suffixes) => translateText(["options", ...suffixes])
  );
  const receiveAccruedTimeOptions = buildTranslatedOptionList(
    receiveAccruedTimeItemList,
    "receiveAccruedTime",
    (suffixes) => translateText(["options", ...suffixes])
  );

  return (
    <div className="flex flex-1 flex-col gap-4">
      <SummaryCard
        title={translateText(["summary", "basicInfoTitle"])}
        onEdit={() => onEdit(LeavePolicyWizardSteps.BASIC_INFO)}
      >
        <SummaryItem
          label={translateText(["summary", "policyNameLabel"])}
          value={formData.policyName}
        />
        <SummaryItem
          label={translateText(["summary", "leaveTypeLabel"])}
          value={formData.leaveTypeName}
        />
        <SummaryItem
          label={translateText(["summary", "policyTypeLabel"])}
          value={translateText(["basicInfo", "accrualTitle"])}
        />
      </SummaryCard>

      <SummaryCard
        title={translateText(["summary", "entitlementSetupTitle"])}
        onEdit={() => onEdit(LeavePolicyWizardSteps.ENTITLEMENT_SETUP)}
      >
        <SummaryItem
          label={translateText(["summary", "accrualRateLabel"])}
          value={
            formData.accrualDays
              ? translateText(["summary", "accrualRateValue"], {
                  days: formData.accrualDays
                })
              : "-"
          }
        />
        <SummaryItem
          label={translateText(["summary", "frequencyLabel"])}
          value={getOptionLabel(
            accrualFrequencyOptions,
            formData.accrualFrequency
          )}
        />
        <SummaryItem
          label={translateText(["summary", "waitingPeriodLabel"])}
          value={
            formData.hasWaitingPeriod && formData.waitingPeriodDays
              ? translateText(["summary", "waitingPeriodDaysValue"], {
                  days: formData.waitingPeriodDays
                })
              : translateText(["summary", "waitingPeriodNo"])
          }
        />
        <SummaryItem
          label={translateText(["summary", "accrualCapLabel"])}
          value={
            formData.hasAccrualCap && formData.accrualCapDays
              ? translateText(["summary", "accrualCapDaysValue"], {
                  days: formData.accrualCapDays
                })
              : translateText(["summary", "accrualCapNo"])
          }
        />
        <SummaryItem
          label={translateText(["summary", "receiveAccruedTimeLabel"])}
          value={getOptionLabel(
            receiveAccruedTimeOptions,
            formData.receiveAccruedTime
          )}
        />
        <SummaryItem
          label={translateText(["summary", "firstAccrualLabel"])}
          value={
            getOptionLabel(firstAccrualOptions, formData.firstAccrual).split(
              ","
            )[0]
          }
        />
      </SummaryCard>

      {formData.canCarryOver && (
        <SummaryCard
          title={translateText(["summary", "carryForwardTitle"])}
          onEdit={() => onEdit(LeavePolicyWizardSteps.ENTITLEMENT_SETUP)}
        >
          <SummaryItem
            label={translateText(["summary", "statusLabel"])}
            value={
              <LeavePolicyStatusBadge
                isActive
                text={translateText(["summary", "activeStatus"])}
              />
            }
          />
          <SummaryItem
            label={translateText(["summary", "maxCarryOverDaysLabel"])}
            value={
              formData.maxCarryOverDays
                ? translateText(["summary", "maxCarryOverDaysValue"], {
                    days: formData.maxCarryOverDays
                  })
                : translateText(["summary", "carryOverNoLimit"])
            }
          />
          <SummaryItem
            label={translateText(["summary", "carryoverExpiryDateLabel"])}
            value={
              formData.carryoverExpiryDate
                ? formatCarryoverExpiryDate(formData.carryoverExpiryDate)
                : translateText(["summary", "carryoverNeverExpires"])
            }
          />
        </SummaryCard>
      )}
    </div>
  );
};

export default SummaryStep;
