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
  accrualFrequencyItemList,
  firstAccrualItemList,
  receiveAccruedTimeItemList
} from "~community/leave/constants/leavePolicyConstants";
import {
  LeavePolicyType,
  PolicyType
} from "~community/leave/types/LeavePolicyTypes";
import {
  buildTranslatedOptionList,
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
  const translateText = useTranslator(
    "leaveModule",
    "leavePolicies",
    "editPolicy"
  );

  const translateEntitlement = useTranslator(
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

  const { setToastMessage } = useToast();

  const isAccrual = policy.policyType === PolicyType.ACCRUAL;

  const onUpdateSuccess = (): void => {
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["successToastTitle"]),
      description: translateText(["successToastDescription"]),
      isIcon: true
    });
    onClose();
  };

  const onUpdateError = (error: AxiosError): void => {
    const { title, description } = getLeavePolicyErrorToastKeys(error);

    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText([title]),
      description: translateText([description]),
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
      validationSchema: editLeavePolicyValidation(translateText),
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
          aria-label={translateText(["closeBtnAriaLabel"])}
        />
        <h1 className="h1 text-black">{translateText(["title"])}</h1>
      </div>

      <div className="flex flex-1 flex-col gap-8">
        <WizardSection title={translateText(["basicDetailsTitle"])}>
          <div className="flex max-w-3xl flex-col gap-4">
            <div className="w-1/2">
              <InputField
                label={translateText(["policyNameLabel"])}
                name="policyName"
                type="text"
                required
                value={values.policyName}
                placeholder={translateText(["policyNamePlaceholder"])}
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
                label={translateText(["leaveTypeLabel"])}
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
              title={translateEntitlement(["accrualScheduleTitle"])}
            >
              <div className="flex max-w-3xl flex-col gap-4 md:flex-row">
                <div className="flex flex-1 flex-col gap-1.5">
                  <InputField
                    label={translateEntitlement(["employeesAccrueLabel"])}
                    name="accrualDays"
                    value={policy.accrualDays ?? ""}
                    placeholder={translateEntitlement([
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
                    label={translateEntitlement(["frequencyLabel"])}
                    value={policy.frequency ?? ""}
                    placeholder={translateEntitlement(["frequencyPlaceholder"])}
                    options={accrualFrequencyOptions}
                    variant="primary-disabled"
                    width="100%"
                    className="rounded-lg"
                  />
                </div>
              </div>
            </WizardSection>

            <WizardSection
              title={translateEntitlement(["accrualOptionsTitle"])}
            >
              <div className="flex max-w-3xl flex-col gap-4">
                <RadioGroup
                  label={translateEntitlement(["waitingPeriodLabel"])}
                  name="editWaitingPeriod"
                  noLabel={translateEntitlement(["waitingPeriodNo"])}
                  yesLabel={translateEntitlement(["waitingPeriodYes"])}
                  value={hasWaitingPeriod}
                  isDisabled
                />
                {hasWaitingPeriod && (
                  <div className="w-full md:w-64">
                    <InputField
                      label={translateEntitlement(["waitingPeriodDaysLabel"])}
                      name="waitingPeriodDays"
                      value={policy.waitingPeriodDays ?? ""}
                      disabled
                      readOnly
                      fullWidth
                    />
                  </div>
                )}
                <RadioGroup
                  label={translateEntitlement(["accrualCapLabel"])}
                  name="editAccrualCap"
                  noLabel={translateEntitlement(["accrualCapNo"])}
                  yesLabel={translateEntitlement(["accrualCapYes"])}
                  value={hasAccrualCap}
                  isDisabled
                />
                {hasAccrualCap && (
                  <div className="w-full md:w-64">
                    <InputField
                      label={translateEntitlement(["accrualCapDaysLabel"])}
                      name="accrualCapDays"
                      value={policy.accrualCapDays ?? ""}
                      disabled
                      readOnly
                      fullWidth
                    />
                  </div>
                )}
                <RadioGroup
                  label={translateEntitlement(["carryOverLabel"])}
                  name="editCarryOver"
                  noLabel={translateEntitlement(["carryOverNo"])}
                  yesLabel={translateEntitlement(["carryOverYes"])}
                  value={canCarryOver}
                  isDisabled
                />
                {canCarryOver && (
                  <div className="flex flex-col gap-4 md:flex-row">
                    <div className="flex flex-1 flex-col gap-1.5">
                      <InputField
                        label={translateEntitlement([
                          "carryoverExpiryDateLabel"
                        ])}
                        name="carryoverExpiryDate"
                        value={carryoverExpiryDate}
                        placeholder={translateEntitlement([
                          "carryoverExpiryDatePlaceholder"
                        ])}
                        disabled
                        readOnly
                        fullWidth
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-1.5">
                      <InputField
                        label={translateEntitlement(["maxCarryOverDaysLabel"])}
                        name="maxCarryOverDays"
                        value={policy.maxCarryoverDays ?? ""}
                        placeholder={translateEntitlement([
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

            <WizardSection title={translateText(["fineTuningTitle"])}>
              <div className="flex max-w-3xl flex-col gap-4">
                <Dropdown
                  id="edit-leave-policy-first-accrual"
                  label={translateEntitlement(["firstAccrualLabel"])}
                  value={policy.firstAccrual ?? ""}
                  options={firstAccrualOptions}
                  variant="primary-disabled"
                  width="50%"
                  className="rounded-lg"
                />
                <Dropdown
                  id="edit-leave-policy-receive-accrued-time"
                  label={translateEntitlement(["receiveAccruedTimeLabel"])}
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
          {translateText(["backBtnTxt"])}
        </ButtonV2>
        <ButtonV2
          variant="primary"
          size="md"
          icon={<SaveIcon className={isSaveDisabled ? "opacity-50" : ""} />}
          iconPosition="end"
          onClick={() => handleSubmit()}
          disabled={isSaveDisabled}
        >
          {translateText([isPending ? "savingBtnTxt" : "saveChangesBtnTxt"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default EditLeavePolicyView;
