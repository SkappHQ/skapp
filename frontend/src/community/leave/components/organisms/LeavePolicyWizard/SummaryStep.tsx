import { Button, StatusComponent } from "@rootcodelabs/skapp-ui";
import { JSX, ReactNode } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  LeavePolicyEntitlementType,
  LeavePolicyFormData,
  LeavePolicyWizardSteps
} from "~community/leave/types/LeavePolicyTypes";

interface Props {
  formData: LeavePolicyFormData;
  onEdit: (step: LeavePolicyWizardSteps) => void;
}

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
    formData.entitlementType === LeavePolicyEntitlementType.ACCRUAL;

  const summaryItem = (label: string, value: ReactNode) => (
    <div className="flex flex-col gap-1">
      <p className="text-sm text-gray-500">{label}</p>
      {typeof value === "string" ? (
        <p className="text-base text-gray-900">{value || "-"}</p>
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
    <div className="flex flex-col gap-6 rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <Button
          variant="transparent"
          size="sm"
          showIcon={false}
          onClick={() => onEdit(step)}
          className="text-blue-600"
        >
          {translateCommonText(["editBtnTxt"])}
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
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
        formData.isCarryForwardEnabled ? "text-green-500" : "text-red-500"
      }
      className="w-fit"
    />
  );

  return (
    <div className="flex flex-1 flex-col gap-6">
      {summaryCard(
        translateText(["basicInfoTitle"]),
        LeavePolicyWizardSteps.BASIC_INFO,
        <>
          {summaryItem(
            translateText(["policyNameLabel"]),
            formData.policyName
          )}
          {summaryItem(translateText(["leaveTypeLabel"]), formData.leaveType)}
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
              formData.accrualFrequency
            )}
            {summaryItem(
              translateText(["resetDateLabel"]),
              formData.resetDate
            )}
            {summaryItem(
              translateText(["waitingPeriodLabel"]),
              formData.hasWaitingPeriod
                ? translateText(["waitingPeriodYes"])
                : translateText(["waitingPeriodNo"])
            )}
            {summaryItem(
              translateText(["accrualCapLabel"]),
              formData.hasAccrualCap
                ? translateText(["accrualCapYes"])
                : translateText(["accrualCapNo"])
            )}
            {summaryItem(
              translateText(["receiveAccruedTimeLabel"]),
              formData.receiveAccruedTime
            )}
            {summaryItem(
              translateText(["firstAccrualLabel"]),
              formData.firstAccrual.split(",")[0]
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
