import { useMemo } from "react";

import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";

import { usePeopleStore } from "../store/store";
import { EditPeopleFormTypes } from "../types/PeopleEditTypes";

const stepSections: Record<number, EditPeopleFormTypes> = {
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

  const goToStep = (step: number) => {
    setActiveStep(step);

    const section = stepSections[step];
    if (section) {
      setCurrentStep(section);
      setNextStep(section);
    }
  };

  const handleNext = () => {
    const nextStep =
      activeStep < steps.length - 1 ? activeStep + 1 : activeStep;
    goToStep(nextStep);
  };

  const handleBack = () => {
    const prevStep = activeStep > 0 ? activeStep - 1 : activeStep;
    goToStep(prevStep);
  };

  return { steps, activeStep, handleNext, handleBack };
};

export default useStepper;
