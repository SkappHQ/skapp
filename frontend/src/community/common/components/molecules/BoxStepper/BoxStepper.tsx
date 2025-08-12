import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { type SxProps } from "@mui/system";
import { FC, type KeyboardEvent, useRef } from "react";

import { KeyboardKeys } from "~community/common/enums/KeyboardEnums";
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
  const tabRefs = useRef<Array<HTMLDivElement | null>>([]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>, index: number) => {
    switch (e.key) {
      case KeyboardKeys.ARROW_RIGHT:
        e.preventDefault();
        if (index < steps.length - 1) {
          tabRefs.current[index + 1]?.focus();
        }
        break;
      case KeyboardKeys.ARROW_LEFT:
        e.preventDefault();
        if (index > 0) {
          tabRefs.current[index - 1]?.focus();
        }
        break;
      case KeyboardKeys.HOME:
        e.preventDefault();
        tabRefs.current[0]?.focus();
        break;
      case KeyboardKeys.END:
        e.preventDefault();
        tabRefs.current[steps.length - 1]?.focus();
        break;
      default:
        if (shouldActivateButton(e.key)) {
          e.preventDefault();
          onStepClick(useStringIdentifier ? steps[index] : index);
        }
    }
  };

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
          ref={(el) => {
            tabRefs.current[index] = el as HTMLDivElement | null;
          }}
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
          tabIndex={activeStep === index || activeStep === step ? 0 : -1}
          onKeyDown={(e) => handleKeyDown(e, index)}
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
