import {
  ArrowLeftIcon,
  ArrowRightIcon,
  Button,
  CloseIcon
} from "@rootcodelabs/skapp-ui";
import { useRouter } from "next/router";
import { JSX, useState } from "react";

import ROUTES from "~community/common/constants/routes";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { leavePolicyFormInitialValues } from "~community/leave/constants/leavePolicyConstants";
import {
  LeavePolicyFormData,
  LeavePolicyWizardSteps
} from "~community/leave/types/LeavePolicyTypes";

import BasicInfoStep from "./BasicInfoStep";
import CarryForwardStep from "./CarryForwardStep";
import EntitlementSetupStep from "./EntitlementSetupStep";
import SummaryStep from "./SummaryStep";
import WizardStepper from "./WizardStepper";

const TOTAL_STEPS = 4;

const LeavePolicyWizard = (): JSX.Element => {
  const router = useRouter();

  const translateText = useTranslator(
    "leaveModule",
    "leavePolicies",
    "createPolicy"
  );

  const [activeStep, setActiveStep] = useState<LeavePolicyWizardSteps>(
    LeavePolicyWizardSteps.BASIC_INFO
  );
  const [formData, setFormData] = useState<LeavePolicyFormData>(
    leavePolicyFormInitialValues
  );

  const steps = [
    translateText(["steps", "basicInfo"]),
    translateText(["steps", "entitlementSetup"]),
    translateText(["steps", "carryForward"]),
    translateText(["steps", "summary"])
  ];

  const handleChange = (values: Partial<LeavePolicyFormData>): void => {
    setFormData((previous) => ({ ...previous, ...values }));
  };

  const handleClose = (): void => {
    router.push(ROUTES.LEAVE.LEAVE_POLICIES);
  };

  const handleBack = (): void => {
    if (activeStep === LeavePolicyWizardSteps.BASIC_INFO) {
      handleClose();
    } else {
      setActiveStep((previous) => previous - 1);
    }
  };

  const handleNext = (): void => {
    if (activeStep === LeavePolicyWizardSteps.SUMMARY) {
      handleClose();
    } else {
      setActiveStep((previous) => previous + 1);
    }
  };

  const renderStep = (): JSX.Element => {
    switch (activeStep) {
      case LeavePolicyWizardSteps.ENTITLEMENT_SETUP:
        return (
          <EntitlementSetupStep formData={formData} onChange={handleChange} />
        );
      case LeavePolicyWizardSteps.CARRY_FORWARD:
        return <CarryForwardStep formData={formData} onChange={handleChange} />;
      case LeavePolicyWizardSteps.SUMMARY:
        return <SummaryStep formData={formData} onEdit={setActiveStep} />;
      case LeavePolicyWizardSteps.BASIC_INFO:
      default:
        return <BasicInfoStep formData={formData} onChange={handleChange} />;
    }
  };

  return (
    <div className="flex min-h-full w-full flex-col gap-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleClose}
            aria-label={translateText(["closeBtnAriaLabel"])}
            className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
          >
            <CloseIcon className="size-4 text-gray-900" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {translateText(["title"])}
          </h1>
          <span className="text-sm font-medium text-blue-600">
            {translateText(["stepCount"], {
              current: String(activeStep + 1),
              total: String(TOTAL_STEPS)
            })}
          </span>
        </div>

        <WizardStepper steps={steps} activeStep={activeStep} />
      </div>

      {renderStep()}

      <div className="mt-auto flex justify-end gap-4 pt-8">
        <Button
          variant="tertiary"
          size="md"
          icon={<ArrowLeftIcon />}
          iconPosition="start"
          onClick={handleBack}
          className="w-40"
        >
          {translateText(["backBtnTxt"])}
        </Button>
        <Button
          variant="primary"
          size="md"
          icon={<ArrowRightIcon />}
          iconPosition="end"
          showIcon={activeStep !== LeavePolicyWizardSteps.SUMMARY}
          onClick={handleNext}
          className="w-40"
        >
          {activeStep === LeavePolicyWizardSteps.SUMMARY
            ? translateText(["createPolicyBtnTxt"])
            : translateText(["nextBtnTxt"])}
        </Button>
      </div>
    </div>
  );
};

export default LeavePolicyWizard;
