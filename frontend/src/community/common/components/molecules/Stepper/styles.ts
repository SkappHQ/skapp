import { Theme } from "@mui/material";

import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  stepper: {
    "& .MuiStep-root:first-of-type": {
      paddingLeft: 0
    },
    "& .MuiStepConnector-line": {
      border: `.0625rem dashed ${theme.palette.grey.A100}`,
      borderRadius: 1
    },
    "& .MuiStepLabel-label": {
      fontWeight: 400,
      fontSize: ".875rem",
      lineHeight: "1rem",
      color: theme.palette.text.secondary,
      "&.Mui-active": {
        color: theme.palette.primary.dark
      },
      "&.Mui-completed": {
        color: theme.palette.primary.dark
      }
    },
    "& .MuiStepIcon-root": {
      height: "2rem",
      width: "2rem",
      borderRadius: "4rem",
      color: theme.palette.common.white,
      border: `.0625rem solid ${theme.palette.grey.A100}`,
      "&.Mui-active": {
        color: theme.palette.secondary.main,
        border: `.0625rem solid ${theme.palette.primary.dark}`
      },
      "&.Mui-completed": {
        color: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.dark,
        border: "none"
      }
    },
    "& .MuiStepIcon-text": {
      fontWeight: 400,
      fontSize: ".625rem",
      lineHeight: "1rem",
      fill: theme.palette.grey.A100,
      "&.Mui-active": {
        fill: theme.palette.primary.dark
      }
    }
  }
});

export default styles;
