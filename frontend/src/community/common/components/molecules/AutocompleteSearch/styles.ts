import { Theme } from "@mui/material";

import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  wrapper: {
    width: "100%"
  },
  label: {
    mb: "0.625rem"
  },
  asterisk: {
    color: theme.palette.error.contrastText
  },
  inputBase: {
    backgroundColor: theme.palette.grey[100],
    padding: "0.75rem 1rem",
    borderRadius: "0.5rem",
    "& .MuiInputBase-input": {
      padding: "0rem"
    }
  },
  optionWrapper: {
    padding: "0rem",
    backgroundColor: theme.palette.grey[100]
  },
  optionWrapperWithoutBg: {
    padding: "0rem"
  },
  group: { padding: "0.5rem 0rem 0.25rem 0rem" },
  groupHeader: {
    color: theme.palette.primary.dark
  },
  children: {},
  chip: {
    cursor: "pointer",
    maxWidth: "fit-content"
  },
  error: {
    color: theme.palette.error.contrastText,
    mt: "0.5rem"
  }
});

export default styles;
