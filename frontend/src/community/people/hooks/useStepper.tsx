import { useMemo } from "react";

import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";

import { usePeopleStore } from "../store/store";
import { EditPeopleFormTypes } from "../types/PeopleEditTypes";

const stepSections: Partial<Record<number, EditPeopleFormTypes>> = {
  0: EditPeopleFormTypes.personal,
  1: EditPeopleFormTypes.emergency,
  2: EditPeopleFormTypes.employment,
  3: EditPeopleFormTypes.permission
};

const useStepper = () => {
  const { activeStep, setActiveStep, setCurrentStep, setNextStep } =
    usePeopleStore((state) => state);

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

  const isLastStep = activeStep === steps.length - 1;

  const goToStep = (stepIndex: number) => {
    if (stepIndex === activeStep) return;

    setActiveStep(stepIndex);

    const section = stepSections[stepIndex];
    if (section) {
      setCurrentStep(section);
      setNextStep(section);
    }
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
