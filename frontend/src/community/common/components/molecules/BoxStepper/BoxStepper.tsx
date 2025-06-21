import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { type SxProps } from "@mui/system";
import { FC } from "react";

import { shouldActivateButton } from "~community/common/utils/keyboardUtils";

interface Props {
  activeStep: number | string;
  steps: string[];
  stepperStyles?: SxProps;
  boxStyles?: SxProps;
  fontStyles?: SxProps;
  onStepClick: (step: number | string) => void;
  useStringIdentifier?: boolean;
  isFullWidth?: boolean;
  "data-testid"?: string;
}
const BoxStepper: FC<Props> = ({
  activeStep,
  steps,
  stepperStyles,
  boxStyles,
  fontStyles,
  onStepClick,
  useStringIdentifier = false,
  isFullWidth = false,
  "data-testid": testId
}) => {
  const theme = useTheme();
  return (
    <Box
      role="tablist"
      sx={{
        display: "flex",
        justifyContent: "center",
        marginBottom: "1rem",
        cursor: "pointer",
        width: isFullWidth ? "100%" : "auto",
        ...stepperStyles
      }}
      data-testid={`${testId}-container`}
    >
      {steps.map((step, index) => (
        <Box
          role="tab"
          aria-selected={activeStep === index || activeStep === step}
          key={index}
          onClick={() => onStepClick(useStringIdentifier ? step : index)}
          data-testid={`${testId}-step-${index}`}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            paddingY: ".75rem",
            paddingX: "1.25rem",
            backgroundColor:
              activeStep === index || activeStep === step
                ? theme.palette.secondary.main
                : theme.palette.grey[100],
            borderTopLeftRadius: index === 0 ? ".75rem" : 0,
            borderBottomLeftRadius: index === 0 ? ".75rem" : 0,
            borderTopRightRadius: index === steps.length - 1 ? ".75rem" : 0,
            borderBottomRightRadius: index === steps.length - 1 ? ".75rem" : 0,
            width: isFullWidth ? "100%" : "8.8125rem",
            "&:hover": {
              backgroundColor:
                activeStep === index || activeStep === step
                  ? theme.palette.secondary.main
                  : theme.palette.grey[200]
            },
            ...boxStyles
          }}
          tabIndex={0}
          onKeyDown={(e) => {
            if (shouldActivateButton(e.key)) {
              onStepClick(useStringIdentifier ? step : index);
            }
          }}
        >
          <Typography
            variant="body1"
            component="h3"
            sx={{
              color:
                activeStep === index || activeStep === step
                  ? theme.palette.primary.dark
                  : "inherit",
              fontWeight:
                activeStep === index || activeStep === step ? 600 : "inherit",
              ...fontStyles
            }}
          >
            {step}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};
export default BoxStepper;
