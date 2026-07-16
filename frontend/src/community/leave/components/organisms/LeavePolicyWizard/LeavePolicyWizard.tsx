import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ButtonV2,
  CloseIcon,
  IconButton,
  SmallModal
} from "@rootcodelabs/skapp-ui";
import { AxiosError } from "axios";
import { useRouter } from "next/router";
import { JSX, useMemo, useState } from "react";

import StepperComponent from "~community/common/components/molecules/Stepper/Stepper";
import ROUTES from "~community/common/constants/routes";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useAddLeavePolicy } from "~community/leave/api/LeavePolicyApi";
import { leavePolicyFormInitialValues } from "~community/leave/constants/leavePolicyConstants";
import {
  LeavePolicyFormData,
  LeavePolicyWizardErrors,
  LeavePolicyWizardSteps,
  PolicyType
} from "~community/leave/types/LeavePolicyTypes";
import {
  getLeavePolicyStepErrors,
  mapLeavePolicyFormToPayload
} from "~community/leave/utils/leavePolicy/leavePolicyUtils";

import BasicInfoStep from "./BasicInfoStep";
import EntitlementSetupStep from "./EntitlementSetupStep";
import SummaryStep from "./SummaryStep";

const TOTAL_STEPS = 3;

const HTTP_STATUS_CONFLICT = 409;

const HTTP_STATUS_FORBIDDEN = 403;

const POLICY_TYPE_SELECT_QUERY = "select-policy-type";

interface Props {
  policyType: PolicyType;
}

const LeavePolicyWizard = ({ policyType }: Props): JSX.Element => {
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
  const [formData, setFormData] = useState<LeavePolicyFormData>({
    ...leavePolicyFormInitialValues,
    policyType
  });
  const [isValidationVisible, setIsValidationVisible] =
    useState<boolean>(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] =
    useState<boolean>(false);

  const steps = [
    translateText(["steps", "basicInfo"]),
    translateText(["steps", "entitlementSetup"]),
    translateText(["steps", "summary"])
  ];

  const stepErrors = useMemo(
    () => getLeavePolicyStepErrors(activeStep, formData),
    [activeStep, formData]
  );

  const visibleErrors: LeavePolicyWizardErrors = useMemo(() => {
    if (!isValidationVisible) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(stepErrors).map(([field, errorKey]) => [
        field,
        translateText(["errors", errorKey as string])
      ])
    );
  }, [isValidationVisible, stepErrors, translateText]);

  const handleClose = (): void => {
    router.push(ROUTES.LEAVE.LEAVE_POLICIES);
  };

  const handleBackToPolicyType = (): void => {
    router.push({
      pathname: ROUTES.LEAVE.LEAVE_POLICIES,
      query: { action: POLICY_TYPE_SELECT_QUERY }
    });
  };

  const handleSuccess = (): void => {
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["successToastTitle"]),
      description: translateText(["successToastDescription"], {
        policyName: formData.policyName.trim()
      })
    });
    handleClose();
  };

  const handleError = (error: AxiosError): void => {
    const status = error?.response?.status;

    if (status === HTTP_STATUS_CONFLICT) {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["duplicateToastTitle"]),
        description: translateText(["duplicateToastDescription"])
      });
    } else if (status === HTTP_STATUS_FORBIDDEN) {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["permissionToastTitle"]),
        description: translateText(["permissionToastDescription"])
      });
    } else {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["errorToastTitle"]),
        description: translateText(["errorToastDescription"])
      });
    }
  };

  const { mutate: addLeavePolicy, isPending } = useAddLeavePolicy(
    handleSuccess,
    handleError
  );

  const handleChange = (values: Partial<LeavePolicyFormData>): void => {
    setFormData((previous) => ({ ...previous, ...values }));
  };

  const handleCancel = (): void => {
    setIsCancelConfirmOpen(true);
  };

  const handleBack = (): void => {
    if (!isAccrual || activeStep === LeavePolicyWizardSteps.BASIC_INFO) {
      handleBackToPolicyType();
    } else {
      setIsValidationVisible(false);
      setActiveStep((previous) => previous - 1);
    }
  };

  const handleNext = (): void => {
    if (Object.keys(stepErrors).length > 0) {
      setIsValidationVisible(true);
      return;
    }

    if (!isAccrual || activeStep === LeavePolicyWizardSteps.SUMMARY) {
      if (!isPending) {
        addLeavePolicy(mapLeavePolicyFormToPayload(formData));
      }
    } else {
      setIsValidationVisible(false);
      setActiveStep((previous) => previous + 1);
    }
  };

  const handleEditFromSummary = (step: LeavePolicyWizardSteps): void => {
    setIsValidationVisible(false);
    setActiveStep(step);
  };

  const renderStep = (): JSX.Element => {
    if (!isAccrual) {
      return (
        <BasicInfoStep
          formData={formData}
          onChange={handleChange}
          errors={visibleErrors}
        />
      );
    }

    switch (activeStep) {
      case LeavePolicyWizardSteps.ENTITLEMENT_SETUP:
        return (
          <EntitlementSetupStep
            formData={formData}
            onChange={handleChange}
            errors={visibleErrors}
          />
        );
      case LeavePolicyWizardSteps.SUMMARY:
        return (
          <SummaryStep formData={formData} onEdit={handleEditFromSummary} />
        );
      case LeavePolicyWizardSteps.BASIC_INFO:
      default:
        return (
          <BasicInfoStep
            formData={formData}
            onChange={handleChange}
            errors={visibleErrors}
          />
        );
    }
  };

  const isLastStep =
    !isAccrual || activeStep === LeavePolicyWizardSteps.SUMMARY;

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

      {renderStep()}

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

      <SmallModal
        isOpen={isCancelConfirmOpen}
        onClose={() => setIsCancelConfirmOpen(false)}
        modalHeader={translateText(["cancelConfirmTitle"])}
        content={
          <p className="body1 text-black">
            {translateText(["cancelConfirmDescription"])}
          </p>
        }
        buttons={{
          buttonLeft: {
            variant: "tertiary",
            onClick: () => setIsCancelConfirmOpen(false),
            icon: <ArrowLeftIcon />,
            iconPosition: "start",
            children: translateText(["cancelDismissBtnTxt"])
          },
          buttonRight: {
            variant: "error",
            onClick: handleClose,
            icon: <CloseIcon />,
            iconPosition: "end",
            children: translateText(["cancelConfirmBtnTxt"])
          }
        }}
      />
    </div>
  );
};

export default LeavePolicyWizard;
