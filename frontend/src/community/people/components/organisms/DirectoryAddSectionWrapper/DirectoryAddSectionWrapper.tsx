import { Box } from "@mui/material";
import { useEffect } from "react";

import StepperComponent from "~community/common/components/molecules/Stepper/Stepper";
import useStepper from "~community/people/hooks/useStepper";
import { usePeopleStore } from "~community/people/store/store";
import { EditPeopleFormTypes } from "~community/people/types/PeopleEditTypes";

import RouteChangeAreYouSureModal from "../../molecules/RouteChangeAreYouSureModal/RouteChangeAreYouSureModal";
import PeopleFormSections from "../PeopleFormSections/PeopleFormSections";
import styles from "./styles";

const DirectoryAddSectionWrapper = () => {
  const classes = styles();

  const { activeStep, steps } = useStepper();

  useEffect(() => {
    return () => {
      const { setCurrentStep, setNextStep } = usePeopleStore.getState();

      setCurrentStep(EditPeopleFormTypes.personal);
      setNextStep(EditPeopleFormTypes.personal);
    };
  }, []);

  return (
    <>
      <Box sx={{ my: "0.75rem" }}>
        <StepperComponent
          activeStep={activeStep}
          steps={steps}
          stepperStyles={classes.stepper}
        />
      </Box>
      <PeopleFormSections isAddFlow={true} />
      <RouteChangeAreYouSureModal />
    </>
  );
};

export default DirectoryAddSectionWrapper;
