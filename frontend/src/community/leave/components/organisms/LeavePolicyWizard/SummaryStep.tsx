import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import LeavePolicyStatusBadge from "~community/leave/components/molecules/LeavePolicyStatusBadge/LeavePolicyStatusBadge";
import {
  accrualFrequencyItemList,
  carryoverDateItemList,
  firstAccrualItemList,
  receiveAccruedTimeItemList
} from "~community/leave/constants/leavePolicyConstants";
import {
  LeavePolicyFormData,
  LeavePolicyWizardSteps
} from "~community/leave/types/LeavePolicyTypes";
import { buildTranslatedOptionList } from "~community/leave/utils/leavePolicy/leavePolicyUtils";

import SummaryCard from "./SummaryCard";
import SummaryItem from "./SummaryItem";

interface Props {
  formData: LeavePolicyFormData;
  onEdit: (step: LeavePolicyWizardSteps) => void;
}

const getOptionLabel = (
  options: { label: string; value: string }[],
  value: string
): string => options.find((option) => option.value === value)?.label ?? "-";

const SummaryStep: FC<Props> = ({ formData, onEdit }) => {
  const translateText = useTranslator(
    "leaveModule",
    "leavePolicies",
    "createPolicy",
    "summary"
  );

  const translateCommonText = useTranslator(
    "leaveModule",
    "leavePolicies",
    "createPolicy"
  );

  const translateOptions = useTranslator(
    "leaveModule",
    "leavePolicies",
    "createPolicy",
    "options"
  );

  const accrualFrequencyOptions = buildTranslatedOptionList(
    accrualFrequencyItemList,
    "accrualFrequency",
    translateOptions
  );
  const carryoverDateOptions = buildTranslatedOptionList(
    carryoverDateItemList,
    "carryoverDate",
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
    <div className="flex flex-1 flex-col gap-4">
      <SummaryCard
        title={translateText(["basicInfoTitle"])}
        onEdit={() => onEdit(LeavePolicyWizardSteps.BASIC_INFO)}
      >
        <SummaryItem
          label={translateText(["policyNameLabel"])}
          value={formData.policyName}
        />
        <SummaryItem
          label={translateText(["leaveTypeLabel"])}
          value={formData.leaveTypeName}
        />
        <SummaryItem
          label={translateText(["policyTypeLabel"])}
          value={translateCommonText(["basicInfo", "accrualTitle"])}
        />
      </SummaryCard>

      <SummaryCard
        title={translateText(["entitlementSetupTitle"])}
        onEdit={() => onEdit(LeavePolicyWizardSteps.ENTITLEMENT_SETUP)}
      >
        <SummaryItem
          label={translateText(["accrualRateLabel"])}
          value={
            formData.accrualDays
              ? translateText(["accrualRateValue"], {
                  days: formData.accrualDays
                })
              : "-"
          }
        />
        <SummaryItem
          label={translateText(["frequencyLabel"])}
          value={getOptionLabel(
            accrualFrequencyOptions,
            formData.accrualFrequency
          )}
        />
        <SummaryItem
          label={translateText(["waitingPeriodLabel"])}
          value={
            formData.hasWaitingPeriod && formData.waitingPeriodDays
              ? translateText(["waitingPeriodDaysValue"], {
                  days: formData.waitingPeriodDays
                })
              : translateText(["waitingPeriodNo"])
          }
        />
        <SummaryItem
          label={translateText(["accrualCapLabel"])}
          value={
            formData.hasAccrualCap && formData.accrualCapDays
              ? translateText(["accrualCapDaysValue"], {
                  days: formData.accrualCapDays
                })
              : translateText(["accrualCapNo"])
          }
        />
        <SummaryItem
          label={translateText(["receiveAccruedTimeLabel"])}
          value={getOptionLabel(
            receiveAccruedTimeOptions,
            formData.receiveAccruedTime
          )}
        />
        <SummaryItem
          label={translateText(["firstAccrualLabel"])}
          value={
            getOptionLabel(firstAccrualOptions, formData.firstAccrual).split(
              ","
            )[0]
          }
        />
      </SummaryCard>

      <SummaryCard
        title={translateText(["carryForwardTitle"])}
        onEdit={() => onEdit(LeavePolicyWizardSteps.ENTITLEMENT_SETUP)}
      >
        <SummaryItem
          label={translateText(["statusLabel"])}
          value={
            <LeavePolicyStatusBadge
              isActive={formData.canCarryOver}
              text={
                formData.canCarryOver
                  ? translateText(["activeStatus"])
                  : translateText(["inactiveStatus"])
              }
            />
          }
        />
        <SummaryItem
          label={translateText(["maxCarryOverDaysLabel"])}
          value={
            formData.canCarryOver && formData.maxCarryOverDays
              ? translateText(["maxCarryOverDaysValue"], {
                  days: formData.maxCarryOverDays
                })
              : translateText(["carryOverNoLimit"])
          }
        />
        {formData.canCarryOver && (
          <SummaryItem
            label={translateText(["carryOverDateLabel"])}
            value={getOptionLabel(
              carryoverDateOptions,
              formData.carryOverDate
            )}
          />
        )}
      </SummaryCard>
    </div>
  );
};

export default SummaryStep;
