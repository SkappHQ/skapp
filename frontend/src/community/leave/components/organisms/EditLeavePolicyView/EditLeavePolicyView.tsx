import {
  ArrowLeftIcon,
  ButtonV2,
  CloseIcon,
  Dropdown,
  IconButton,
  InputField,
  SaveIcon
} from "@rootcodelabs/skapp-ui";
import { AxiosError } from "axios";
import { useFormik } from "formik";
import { ChangeEvent, FC } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { getEmoji } from "~community/common/utils/commonUtil";
import { useUpdateLeavePolicy } from "~community/leave/api/LeavePolicyApi";
import RadioGroup from "~community/leave/components/organisms/LeavePolicyWizard/RadioGroup";
import WizardSection from "~community/leave/components/organisms/LeavePolicyWizard/WizardSection";
import {
  AccrualFrequency,
  AccrualTiming,
  FirstAccrualType,
  LeavePolicyType,
  PolicyType
} from "~community/leave/types/LeavePolicyTypes";
import {
  formatCarryoverExpiryDate,
  getLeavePolicyErrorToastKeys
} from "~community/leave/utils/leavePolicy/leavePolicyUtils";
import { editLeavePolicyValidation } from "~community/leave/utils/validations";

interface Props {
  policy: LeavePolicyType;
  onClose: () => void;
}

interface EditLeavePolicyFormValues {
  policyName: string;
}

const EditLeavePolicyView: FC<Props> = ({ policy, onClose }) => {
  const translateText = useTranslator("leaveModule", "leavePolicies");

  const translateOptions = useTranslator(
    "leaveModule",
    "leavePolicies",
    "createPolicy",
    "options"
  );

  const { setToastMessage } = useToast();

  const isAccrual = policy.policyType === PolicyType.ACCRUAL;

  const onUpdateSuccess = (): void => {
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["editPolicy", "successToastTitle"]),
      description: translateText(["editPolicy", "successToastDescription"]),
      isIcon: true
    });
    onClose();
  };

  const onUpdateError = (error: AxiosError): void => {
    const { title, description } = getLeavePolicyErrorToastKeys(error);

    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["editPolicy", title]),
      description: translateText(["editPolicy", description]),
      isIcon: true
    });
  };

  const { mutate: updateLeavePolicy, isPending } = useUpdateLeavePolicy(
    onUpdateSuccess,
    onUpdateError
  );

  const onSubmit = (formValues: EditLeavePolicyFormValues): void => {
    updateLeavePolicy({
      id: policy.id,
      payload: { name: formValues.policyName.trim() }
    });
  };

  const { values, errors, touched, handleBlur, handleChange, handleSubmit } =
    useFormik<EditLeavePolicyFormValues>({
      initialValues: { policyName: policy.name },
      validationSchema: editLeavePolicyValidation((suffixes: string[]) =>
        translateText(["editPolicy", ...suffixes])
      ),
      enableReinitialize: true,
      onSubmit
    });

  const policyNameError = touched.policyName ? errors.policyName : undefined;

  const isChanged = values.policyName.trim() !== policy.name;
  const isSaveDisabled = isPending || !isChanged || Boolean(errors.policyName);

  const leaveTypeLabel = policy.leaveTypeEmoji
    ? `${getEmoji(policy.leaveTypeEmoji)} ${policy.leaveTypeName}`
    : policy.leaveTypeName;

  const leaveTypeOptions = [
    {
      id: String(policy.leaveTypeId),
      label: leaveTypeLabel,
      value: String(policy.leaveTypeId)
    }
  ];

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

  const hasWaitingPeriod = Number(policy.waitingPeriodDays ?? 0) > 0;
  const hasAccrualCap = Number(policy.accrualCapDays ?? 0) > 0;
  const canCarryOver = Boolean(policy.isCarryoverEnabled);

  const carryoverExpiryDate = formatCarryoverExpiryDate(
    policy.carryoverExpiryDate ?? ""
  );

  return (
    <div className="flex min-h-full w-full flex-col gap-8">
      <div className="flex items-center gap-4">
        <IconButton
          icon={<CloseIcon className="size-4 text-black" />}
          isRounded
          variant="tertiary"
          onClick={onClose}
          aria-label={translateText(["editPolicy", "closeBtnAriaLabel"])}
        />
        <h1 className="h1 text-black">
          {translateText(["editPolicy", "title"])}
        </h1>
      </div>

      <div className="flex flex-1 flex-col gap-8">
        <WizardSection
          title={translateText(["editPolicy", "basicDetailsTitle"])}
        >
          <div className="flex max-w-3xl flex-col gap-4">
            <div className="w-1/2">
              <InputField
                label={translateText(["editPolicy", "policyNameLabel"])}
                name="policyName"
                type="text"
                required
                value={values.policyName}
                placeholder={translateText([
                  "editPolicy",
                  "policyNamePlaceholder"
                ])}
                state={policyNameError ? "error" : "default"}
                errorMessage={policyNameError}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  handleChange(event)
                }
                onBlur={handleBlur}
                disabled={isPending}
                fullWidth
              />
            </div>
            <div className="w-1/2">
              <Dropdown
                id="edit-leave-policy-leave-type"
                label={translateText(["editPolicy", "leaveTypeLabel"])}
                required
                value={String(policy.leaveTypeId)}
                options={leaveTypeOptions}
                variant="primary-disabled"
                width="100%"
                className="rounded-lg"
              />
            </div>
          </div>
        </WizardSection>

        {isAccrual && (
          <>
            <WizardSection
              title={translateText([
                "createPolicy",
                "entitlementSetup",
                "accrualScheduleTitle"
              ])}
            >
              <div className="flex max-w-3xl flex-col gap-4 md:flex-row">
                <div className="flex flex-1 flex-col gap-1.5">
                  <InputField
                    label={translateText([
                      "createPolicy",
                      "entitlementSetup",
                      "employeesAccrueLabel"
                    ])}
                    name="accrualDays"
                    value={policy.accrualDays ?? ""}
                    placeholder={translateText([
                      "createPolicy",
                      "entitlementSetup",
                      "employeesAccruePlaceholder"
                    ])}
                    disabled
                    readOnly
                    fullWidth
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  <Dropdown
                    id="edit-leave-policy-accrual-frequency"
                    label={translateText([
                      "createPolicy",
                      "entitlementSetup",
                      "frequencyLabel"
                    ])}
                    value={policy.frequency ?? ""}
                    placeholder={translateText([
                      "createPolicy",
                      "entitlementSetup",
                      "frequencyPlaceholder"
                    ])}
                    options={accrualFrequencyOptions}
                    variant="primary-disabled"
                    width="100%"
                    className="rounded-lg"
                  />
                </div>
              </div>
            </WizardSection>

            <WizardSection
              title={translateText([
                "createPolicy",
                "entitlementSetup",
                "accrualOptionsTitle"
              ])}
            >
              <div className="flex max-w-3xl flex-col gap-4">
                <RadioGroup
                  label={translateText([
                    "createPolicy",
                    "entitlementSetup",
                    "waitingPeriodLabel"
                  ])}
                  name="editWaitingPeriod"
                  noLabel={translateText([
                    "createPolicy",
                    "entitlementSetup",
                    "waitingPeriodNo"
                  ])}
                  yesLabel={translateText([
                    "createPolicy",
                    "entitlementSetup",
                    "waitingPeriodYes"
                  ])}
                  value={hasWaitingPeriod}
                  isDisabled
                />
                {hasWaitingPeriod && (
                  <div className="w-full md:w-64">
                    <InputField
                      label={translateText([
                        "createPolicy",
                        "entitlementSetup",
                        "waitingPeriodDaysLabel"
                      ])}
                      name="waitingPeriodDays"
                      value={policy.waitingPeriodDays ?? ""}
                      disabled
                      readOnly
                      fullWidth
                    />
                  </div>
                )}
                <RadioGroup
                  label={translateText([
                    "createPolicy",
                    "entitlementSetup",
                    "accrualCapLabel"
                  ])}
                  name="editAccrualCap"
                  noLabel={translateText([
                    "createPolicy",
                    "entitlementSetup",
                    "accrualCapNo"
                  ])}
                  yesLabel={translateText([
                    "createPolicy",
                    "entitlementSetup",
                    "accrualCapYes"
                  ])}
                  value={hasAccrualCap}
                  isDisabled
                />
                {hasAccrualCap && (
                  <div className="w-full md:w-64">
                    <InputField
                      label={translateText([
                        "createPolicy",
                        "entitlementSetup",
                        "accrualCapDaysLabel"
                      ])}
                      name="accrualCapDays"
                      value={policy.accrualCapDays ?? ""}
                      disabled
                      readOnly
                      fullWidth
                    />
                  </div>
                )}
                <RadioGroup
                  label={translateText([
                    "createPolicy",
                    "entitlementSetup",
                    "carryOverLabel"
                  ])}
                  name="editCarryOver"
                  noLabel={translateText([
                    "createPolicy",
                    "entitlementSetup",
                    "carryOverNo"
                  ])}
                  yesLabel={translateText([
                    "createPolicy",
                    "entitlementSetup",
                    "carryOverYes"
                  ])}
                  value={canCarryOver}
                  isDisabled
                />
                {canCarryOver && (
                  <div className="flex flex-col gap-4 md:flex-row">
                    <div className="flex flex-1 flex-col gap-1.5">
                      <InputField
                        label={translateText([
                          "createPolicy",
                          "entitlementSetup",
                          "carryoverExpiryDateLabel"
                        ])}
                        name="carryoverExpiryDate"
                        value={carryoverExpiryDate}
                        placeholder={translateText([
                          "createPolicy",
                          "entitlementSetup",
                          "carryoverExpiryDatePlaceholder"
                        ])}
                        disabled
                        readOnly
                        fullWidth
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-1.5">
                      <InputField
                        label={translateText([
                          "createPolicy",
                          "entitlementSetup",
                          "maxCarryOverDaysLabel"
                        ])}
                        name="maxCarryOverDays"
                        value={policy.maxCarryoverDays ?? ""}
                        placeholder={translateText([
                          "createPolicy",
                          "entitlementSetup",
                          "maxCarryOverDaysPlaceholder"
                        ])}
                        disabled
                        readOnly
                        fullWidth
                      />
                    </div>
                  </div>
                )}
              </div>
            </WizardSection>

            <WizardSection
              title={translateText(["editPolicy", "fineTuningTitle"])}
            >
              <div className="flex max-w-3xl flex-col gap-4">
                <Dropdown
                  id="edit-leave-policy-first-accrual"
                  label={translateText([
                    "createPolicy",
                    "entitlementSetup",
                    "firstAccrualLabel"
                  ])}
                  value={policy.firstAccrual ?? ""}
                  options={firstAccrualOptions}
                  variant="primary-disabled"
                  width="50%"
                  className="rounded-lg"
                />
                <Dropdown
                  id="edit-leave-policy-receive-accrued-time"
                  label={translateText([
                    "createPolicy",
                    "entitlementSetup",
                    "receiveAccruedTimeLabel"
                  ])}
                  value={policy.accrualTiming ?? ""}
                  options={receiveAccruedTimeOptions}
                  variant="primary-disabled"
                  width="50%"
                  className="rounded-lg"
                />
              </div>
            </WizardSection>
          </>
        )}
      </div>

      <div className="mt-auto flex justify-end gap-4 pt-8">
        <ButtonV2
          variant="tertiary"
          size="md"
          icon={<ArrowLeftIcon />}
          iconPosition="start"
          onClick={onClose}
          disabled={isPending}
        >
          {translateText(["editPolicy", "backBtnTxt"])}
        </ButtonV2>
        <ButtonV2
          variant="primary"
          size="md"
          icon={<SaveIcon className={isSaveDisabled ? "opacity-50" : ""} />}
          iconPosition="end"
          onClick={() => handleSubmit()}
          disabled={isSaveDisabled}
        >
          {translateText([
            "editPolicy",
            isPending ? "savingBtnTxt" : "saveChangesBtnTxt"
          ])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default EditLeavePolicyView;
