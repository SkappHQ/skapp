import { Step, StepLabel, Stepper, Theme, useTheme } from "@mui/material";
import { type SxProps } from "@mui/system";
import { JSX } from "react";

import { mergeSx } from "~community/common/utils/commonUtil";

import CustomIcon from "./CustomIcon/CustomIcon";
import styles from "./styles";

interface Props {
  activeStep: number;
  steps: string[];
  stepperStyles?: SxProps;
}

const StepperComponent = ({
  activeStep,
  steps,
  stepperStyles
}: Props): JSX.Element => {
  const theme: Theme = useTheme();
  const classes = styles(theme);

  return (
    <Stepper
      activeStep={activeStep}
      sx={mergeSx([classes.stepper, stepperStyles])}
    >
      {steps.map((label, index) => {
        return (
          <Step key={`${index}-${label}`}>
            <StepLabel
              slots={{
                stepIcon: (props) => (
                  <CustomIcon
                    {...props}
                    stepNumber={`${index + 1}`}
                    isActive={index === activeStep}
                  />
                )
              }}
            >
              {label}
            </StepLabel>
          </Step>
        );
      })}
    </Stepper>
  );
};

export default StepperComponent;
