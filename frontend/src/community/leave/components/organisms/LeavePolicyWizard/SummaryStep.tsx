import { ButtonV2, Card, StatusComponent } from "@rootcodelabs/skapp-ui";
import { JSX, ReactNode } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
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
    <Card className="flex flex-col gap-4 py-4">
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
    </Card>
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
          {summaryItem(
            translateText(["policyTypeLabel"]),
            translateCommonText(["basicInfo", "accrualTitle"])
          )}
        </>
      )}

      {summaryCard(
        translateText(["entitlementSetupTitle"]),
        LeavePolicyWizardSteps.ENTITLEMENT_SETUP,
        <>
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
            getOptionLabel(accrualFrequencyItemList, formData.accrualFrequency)
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
      )}

      {summaryCard(
        translateText(["carryForwardTitle"]),
        LeavePolicyWizardSteps.ENTITLEMENT_SETUP,
        <>
          {summaryItem(
            translateText(["statusLabel"]),
            <StatusComponent
              text={
                formData.canCarryOver
                  ? translateCommonText(["summary", "activeStatus"])
                  : translateCommonText(["summary", "inactiveStatus"])
              }
              iconColor={
                formData.canCarryOver
                  ? "var(--color-semantic-green-accent)"
                  : "var(--color-semantic-red-accent)"
              }
              textColor="text-secondary-text"
              className="w-fit"
            />
          )}
          {summaryItem(
            translateText(["maxCarryOverDaysLabel"]),
            formData.canCarryOver && formData.maxCarryOverDays
              ? translateText(["maxCarryOverDaysValue"], {
                  days: formData.maxCarryOverDays
                })
              : translateText(["carryOverNoLimit"])
          )}
          {formData.canCarryOver &&
            summaryItem(
              translateText(["carryOverDateLabel"]),
              getOptionLabel(carryoverDateItemList, formData.carryOverDate)
            )}
        </>
      )}
    </div>
  );
};

export default SummaryStep;
