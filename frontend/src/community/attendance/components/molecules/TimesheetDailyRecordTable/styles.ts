import { Theme } from "@mui/material";

import { colorSelector } from "~community/attendance/constants/constants";

const styles = (theme: Theme) => ({
  dailyLogChipStyles: (type: string) => ({
    backgroundColor: colorSelector[type],
    width: "1.5rem",
    height: "1.5rem",
    borderRadius: "0.375rem"
  }),
  container: {
    mb: "1.5rem"
  },
  stackContainer: {
    mt: "1rem",
    width: "100%",
    borderRadius: "0.5rem",
    overflowX: "auto",
    position: "relative",
    "&::-webkit-scrollbar": {
      height: "0.4em",
      backgroundColor: "transparent",
      outline: "none"
    },
    "&::-webkit-scrollbar-track": {
      marginLeft: "18rem",
      backgroundColor: "rgba(0,0,0,.1)"
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(0,0,0,.2)",
      borderRadius: "2px"
    }
  },
  boxContainer: {
    maxWidth: "900px"
  },
  tableFooterStackStyle: {
    pb: "0.938rem",
    backgroundColor: theme.palette.grey[100],
    borderRadius: "0rem 0rem 0.5rem 0.5rem",
    justifyItems: "end"
  },
  dividerStyle: {
    color: theme.palette.grey.A100
  },
  buttonStyle: {
    mt: "1rem",
    mr: "1rem",
    ".MuiButton-endIcon": {
      "svg path": {
        fill: "none"
      }
    }
  }
});

export default styles;
