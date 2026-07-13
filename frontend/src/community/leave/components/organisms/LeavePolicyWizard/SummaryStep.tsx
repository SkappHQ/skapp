import { ButtonV2, StatusComponent } from "@rootcodelabs/skapp-ui";
import { JSX, ReactNode } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  accrualFrequencyItemList,
  firstAccrualItemList,
  receiveAccruedTimeItemList
} from "~community/leave/constants/leavePolicyConstants";
import {
  PolicyType,
  LeavePolicyFormData,
  LeavePolicyWizardSteps
} from "~community/leave/types/LeavePolicyTypes";

interface Props {
  formData: LeavePolicyFormData;
  onEdit: (step: LeavePolicyWizardSteps) => void;
}

const getOptionLabel = (
  options: { label: string; value: string }[],
  value: string
): string => options.find((option) => option.value === value)?.label ?? "-";

const SummaryStep = ({ formData, onEdit }: Props): JSX.Element => {
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

  const isAccrual =
    formData.policyType === PolicyType.ACCRUAL;

  const summaryItem = (label: string, value: ReactNode) => (
    <div className="flex flex-col gap-1">
      <p className="subtitle4 text-secondary-text">{label}</p>
      {typeof value === "string" ? (
        <p className="body1 text-black">{value || "-"}</p>
      ) : (
        value
      )}
    </div>
  );

  const summaryCard = (
    title: string,
    step: LeavePolicyWizardSteps,
    children: ReactNode
  ) => (
    <div className="flex flex-col gap-4 rounded-lg border border-secondary-accent p-4">
      <div className="flex items-center justify-between">
        <h3 className="h2 text-black">{title}</h3>
        <ButtonV2
          variant="line"
          size="sm"
          onClick={() => onEdit(step)}
          aria-label={`${translateCommonText(["editBtnTxt"])} ${title}`}
          className="text-primary-text"
        >
          {translateCommonText(["editBtnTxt"])}
        </ButtonV2>
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        {children}
      </div>
    </div>
  );

  const statusChip = (
    <StatusComponent
      text={
        formData.isCarryForwardEnabled
          ? translateText(["statusActive"])
          : translateText(["statusInactive"])
      }
      iconColor={
        formData.isCarryForwardEnabled
          ? "var(--color-semantic-green-accent)"
          : "var(--color-semantic-red-accent)"
      }
      className="w-fit"
    />
  );

  return (
    <div className="flex flex-1 flex-col gap-4">
      {summaryCard(
        translateText(["basicInfoTitle"]),
        LeavePolicyWizardSteps.BASIC_INFO,
        <>
          {summaryItem(
            translateText(["policyNameLabel"]),
            formData.policyName
          )}
          {summaryItem(
            translateText(["leaveTypeLabel"]),
            formData.leaveTypeName
          )}
        </>
      )}

      {summaryCard(
        translateText(["entitlementSetupTitle"]),
        LeavePolicyWizardSteps.ENTITLEMENT_SETUP,
        isAccrual ? (
          <>
            {summaryItem(
              translateText(["policyTypeLabel"]),
              translateCommonText(["basicInfo", "accrualTitle"])
            )}
            {summaryItem(
              translateText(["accrualRateLabel"]),
              formData.accrualDays
                ? translateText(["accrualRateValue"], {
                    days: formData.accrualDays
                  })
                : "-"
            )}
            {summaryItem(
              translateText(["frequencyLabel"]),
              getOptionLabel(
                accrualFrequencyItemList,
                formData.accrualFrequency
              )
            )}
            {summaryItem(
              translateText(["waitingPeriodLabel"]),
              formData.hasWaitingPeriod && formData.waitingPeriodDays
                ? translateText(["waitingPeriodDaysValue"], {
                    days: formData.waitingPeriodDays
                  })
                : translateText(["waitingPeriodNo"])
            )}
            {summaryItem(
              translateText(["accrualCapLabel"]),
              formData.hasAccrualCap && formData.accrualCapDays
                ? translateText(["accrualCapDaysValue"], {
                    days: formData.accrualCapDays
                  })
                : translateText(["accrualCapNo"])
            )}
            {summaryItem(
              translateText(["receiveAccruedTimeLabel"]),
              getOptionLabel(
                receiveAccruedTimeItemList,
                formData.receiveAccruedTime
              )
            )}
            {summaryItem(
              translateText(["firstAccrualLabel"]),
              getOptionLabel(firstAccrualItemList, formData.firstAccrual).split(
                ","
              )[0]
            )}
          </>
        ) : (
          <>
            {summaryItem(
              translateText(["policyTypeLabel"]),
              translateCommonText(["basicInfo", "fixedTitle"])
            )}
            {summaryItem(
              translateText(["totalDaysAllocatedLabel"]),
              formData.totalDaysAllocated
                ? translateText(["totalDaysAllocatedValue"], {
                    days: formData.totalDaysAllocated
                  })
                : "-"
            )}
          </>
        )
      )}

      {summaryCard(
        translateText(["carryForwardTitle"]),
        LeavePolicyWizardSteps.CARRY_FORWARD,
        <>
          {summaryItem(translateText(["statusLabel"]), statusChip)}
          {summaryItem(
            translateText(["maxCarryDaysLabel"]),
            formData.isCarryForwardEnabled && formData.maxCarryForwardDays
              ? translateText(["maxCarryDaysValue"], {
                  days: formData.maxCarryForwardDays
                })
              : "-"
          )}
          {summaryItem(
            translateText(["expiryDateLabel"]),
            formData.isCarryForwardEnabled && formData.carryForwardExpiryDate
              ? formData.carryForwardExpiryDate.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })
              : "-"
          )}
        </>
      )}
    </div>
  );
};

export default SummaryStep;
