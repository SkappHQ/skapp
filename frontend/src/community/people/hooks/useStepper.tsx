import { useMemo } from "react";

import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import useLeavePoliciesEnabled from "~community/leave/hooks/useLeavePoliciesEnabled";

import { usePeopleStore } from "../store/store";

const useStepper = () => {
  const { activeStep, setActiveStep } = usePeopleStore((state) => state);

  const translateText = useTranslator(
    "peopleModule",
    "addResource",
    "commonText"
  );

  const { isLeaveModuleEnabled } = useSessionData();

  const { isLeavePoliciesEnabled } =
    useLeavePoliciesEnabled(isLeaveModuleEnabled);

  // Entitlements are replaced by leave policies once policies are enabled.
  const isEntitlementsStepVisible =
    isLeaveModuleEnabled && !isLeavePoliciesEnabled;

  const steps = useMemo(() => {
    let steps = [
      translateText(["personal"]),
      translateText(["emergency"]),
      translateText(["employment"]),
      translateText(["systemPermissions"]),
      translateText(["entitlements"])
    ];

    if (!isEntitlementsStepVisible) {
      steps = steps.filter((step) => step !== translateText(["entitlements"]));
    }

    return steps;
  }, [isEntitlementsStepVisible, translateText]);

  const isLastStep = activeStep === steps.length - 1;

  const goToStep = (stepIndex: number) => {
    if (stepIndex === activeStep) return;

    setActiveStep(stepIndex);
  };

  const handleNext = () => {
    const nextIndex =
      activeStep < steps.length - 1 ? activeStep + 1 : activeStep;
    goToStep(nextIndex);
  };

  const handleBack = () => {
    const prevIndex = activeStep > 0 ? activeStep - 1 : activeStep;
    goToStep(prevIndex);
  };

  return { steps, activeStep, isLastStep, handleNext, handleBack };
};

export default useStepper;
