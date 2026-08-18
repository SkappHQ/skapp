import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ButtonV2,
  CloseIcon,
  IconButton
} from "@rootcodelabs/skapp-ui";
import { AxiosError } from "axios";
import { FormikProps, useFormik } from "formik";
import { useRouter } from "next/router";
import { FC, useRef, useState } from "react";

import StepperComponent from "~community/common/components/molecules/Stepper/Stepper";
import ROUTES from "~community/common/constants/routes";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useAddLeavePolicy } from "~community/leave/api/LeavePolicyApi";
import { leavePolicyFormInitialValues } from "~community/leave/constants/leavePolicyConstants";
import {
  LeavePolicyFormData,
  LeavePolicyWizardSteps,
  PolicyType
} from "~community/leave/types/LeavePolicyTypes";
import {
  getLeavePolicyErrorToastKeys,
  isDuplicatePolicyNameError,
  mapLeavePolicyFormToPayload
} from "~community/leave/utils/leavePolicy/leavePolicyUtils";
import { leavePolicyWizardValidation } from "~community/leave/utils/validations";

import CancelPolicyCreationModal from "./CancelPolicyCreationModal";
import LeavePolicyStepContent from "./LeavePolicyStepContent";

const TOTAL_STEPS = 3;

const STEP_FIELDS: Record<
  LeavePolicyWizardSteps,
  (keyof LeavePolicyFormData)[]
> = {
  [LeavePolicyWizardSteps.BASIC_INFO]: ["policyName", "leaveType"],
  [LeavePolicyWizardSteps.ENTITLEMENT_SETUP]: [
    "accrualDays",
    "accrualFrequency",
    "waitingPeriodDays",
    "accrualCapDays",
    "maxCarryOverDays"
  ],
  [LeavePolicyWizardSteps.SUMMARY]: []
};

interface Props {
  policyType: PolicyType;
}

const LeavePolicyWizard: FC<Props> = ({ policyType }) => {
  const router = useRouter();

  const { setToastMessage } = useToast();

  const translateText = useTranslator(
    "leaveModule",
    "leavePolicies",
    "createPolicy"
  );

  const isAccrual = policyType === PolicyType.ACCRUAL;

  const [activeStep, setActiveStep] = useState<LeavePolicyWizardSteps>(
    LeavePolicyWizardSteps.BASIC_INFO
  );
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] =
    useState<boolean>(false);

  const submittedNameRef = useRef<string>("");

  const formikRef = useRef<FormikProps<LeavePolicyFormData> | null>(null);

  const steps = [
    translateText(["steps", "basicInfo"]),
    translateText(["steps", "entitlementSetup"]),
    translateText(["steps", "summary"])
  ];

  const handleClose = (): void => {
    router.push(ROUTES.LEAVE.LEAVE_POLICIES);
  };

  const handleBackToPolicyType = (): void => {
    router.push(ROUTES.LEAVE.LEAVE_POLICIES);
  };

  const handleSuccess = (): void => {
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["successToastTitle"]),
      description: translateText(["successToastDescription"], {
        policyName: submittedNameRef.current
      })
    });
    handleClose();
  };

  const handleError = (error: AxiosError): void => {
    if (isDuplicatePolicyNameError(error)) {
      formikRef.current?.setFieldTouched("policyName", true, false);
      formikRef.current?.setFieldError(
        "policyName",
        translateText(["duplicateToastDescription"])
      );
      setActiveStep(LeavePolicyWizardSteps.BASIC_INFO);
      return;
    }

    const { title, description } = getLeavePolicyErrorToastKeys(error);

    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText([title]),
      description: translateText([description])
    });
  };

  const { mutate: addLeavePolicy, isPending } = useAddLeavePolicy(
    handleSuccess,
    handleError
  );

  const formik = useFormik<LeavePolicyFormData>({
    initialValues: { ...leavePolicyFormInitialValues, policyType },
    validationSchema: leavePolicyWizardValidation(translateText, isAccrual),
    validateOnBlur: false,
    onSubmit: (values) => {
      submittedNameRef.current = values.policyName.trim();
      addLeavePolicy(mapLeavePolicyFormToPayload(values));
    }
  });

  formikRef.current = formik;

  const handleFieldsChange = (values: Partial<LeavePolicyFormData>): void => {
    formik.setValues({ ...formik.values, ...values });
  };

  const handleCancel = (): void => {
    setIsCancelConfirmOpen(true);
  };

  const isLastStep =
    !isAccrual || activeStep === LeavePolicyWizardSteps.SUMMARY;

  const handleBack = (): void => {
    if (!isAccrual || activeStep === LeavePolicyWizardSteps.BASIC_INFO) {
      handleBackToPolicyType();
    } else {
      setActiveStep((previous) => previous - 1);
    }
  };

  const handleNext = async (): Promise<void> => {
    const currentStepFields = STEP_FIELDS[activeStep];
    const validationErrors = await formik.validateForm();
    const hasStepError = currentStepFields.some(
      (field) => validationErrors[field]
    );

    if (hasStepError) {
      await formik.setTouched(
        currentStepFields.reduce(
          (touched, field) => ({ ...touched, [field]: true }),
          formik.touched
        )
      );
      return;
    }

    if (isLastStep) {
      if (!isPending) {
        await formik.submitForm();
      }
      return;
    }

    setActiveStep((previous) => previous + 1);
  };

  const handleEditFromSummary = (step: LeavePolicyWizardSteps): void => {
    setActiveStep(step);
  };

  return (
    <div className="flex min-h-full w-full flex-col gap-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <IconButton
            icon={<CloseIcon className="size-4 text-black" />}
            isRounded
            variant="tertiary"
            onClick={handleCancel}
            aria-label={translateText(["closeBtnAriaLabel"])}
          />
          <h1 className="h1 text-black">{translateText(["title"])}</h1>
          {isAccrual && (
            <span className="subtitle3 text-primary-text">
              {translateText(["stepCount"], {
                current: String(activeStep + 1),
                total: String(TOTAL_STEPS)
              })}
            </span>
          )}
        </div>

        {isAccrual && (
          <StepperComponent
            steps={steps}
            activeStep={activeStep}
            stepperStyles={{ maxWidth: "42.5rem" }}
          />
        )}
      </div>

      <LeavePolicyStepContent
        activeStep={activeStep}
        isAccrual={isAccrual}
        formData={formik.values}
        errors={formik.errors}
        touched={formik.touched}
        onChange={handleFieldsChange}
        onEditFromSummary={handleEditFromSummary}
      />

      <div className="mt-auto flex justify-end gap-4 pt-8">
        <ButtonV2
          variant="tertiary"
          size="md"
          icon={<ArrowLeftIcon />}
          iconPosition="start"
          onClick={handleBack}
          disabled={isPending}
        >
          {translateText(["backBtnTxt"])}
        </ButtonV2>
        <ButtonV2
          variant="primary"
          size="md"
          icon={!isLastStep ? <ArrowRightIcon /> : undefined}
          iconPosition="end"
          onClick={handleNext}
          disabled={isPending}
        >
          {isLastStep
            ? translateText([isPending ? "savingBtnTxt" : "createPolicyBtnTxt"])
            : translateText(["nextBtnTxt"])}
        </ButtonV2>
      </div>

      <CancelPolicyCreationModal
        isOpen={isCancelConfirmOpen}
        onDismiss={() => setIsCancelConfirmOpen(false)}
        onConfirm={handleClose}
      />
    </div>
  );
};

export default LeavePolicyWizard;
