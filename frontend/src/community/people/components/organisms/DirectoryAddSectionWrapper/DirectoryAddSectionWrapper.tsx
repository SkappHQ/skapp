import { Box } from "@mui/material";

import StepperComponent from "~community/common/components/molecules/Stepper/Stepper";
import useStepper from "~community/people/hooks/useStepper";

import RouteChangeAreYouSureModal from "../../molecules/RouteChangeAreYouSureModal/RouteChangeAreYouSureModal";
import PeopleFormSections from "../PeopleFormSections/PeopleFormSections";
import styles from "./styles";

const DirectoryAddSectionWrapper = () => {
  const classes = styles();

  const { activeStep, steps } = useStepper();

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
