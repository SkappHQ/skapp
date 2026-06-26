import { useMemo } from "react";

import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";

import { usePeopleStore } from "../store/store";

const useStepper = () => {
  const { activeStep, setActiveStep } = usePeopleStore((state) => state);

  const translateText = useTranslator(
    "peopleModule",
    "addResource",
    "commonText"
  );

  const { isLeaveModuleEnabled } = useSessionData();

  const steps = useMemo(() => {
    let steps = [
      translateText(["personal"]),
      translateText(["emergency"]),
      translateText(["employment"]),
      translateText(["systemPermissions"]),
      translateText(["entitlements"])
    ];

    if (!isLeaveModuleEnabled) {
      steps = steps.filter((step) => step !== translateText(["entitlements"]));
    }

    return steps;
  }, [isLeaveModuleEnabled, translateText]);

  const handleNext = () => {
    const nextStep =
      activeStep < steps.length - 1 ? activeStep + 1 : activeStep;
    setActiveStep(nextStep);
  };

  const handleBack = () => {
    const prevStep = activeStep > 0 ? activeStep - 1 : activeStep;
    setActiveStep(prevStep);
  };

  return { steps, activeStep, handleNext, handleBack };
};

export default useStepper;
