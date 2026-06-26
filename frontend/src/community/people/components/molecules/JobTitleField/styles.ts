import { Theme } from "@mui/material";

import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  fieldWrapper: {
    flexDirection: "row",
    gap: "0.75rem",
    width: "100%"
  },
  jobTitleInputField: { mt: "1rem", width: "100%" },
  inputFieldComponent: {
    mt: "0rem",
    "&& .MuiInputBase-input": {
      "&.Mui-disabled": {
        WebkitTextFillColor: theme.palette.text.secondary
      }
    }
  },
  addIconBtn: {
    width: "3rem",
    height: "3rem",
    backgroundColor: "primary.main",
    marginTop: "3rem"
  },
  scrollContainer: {
    overflowY: "auto",
    maxHeight: "10.5rem",
    marginTop: "1.5rem"
  },
  valueContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    marginRight: "0.1875rem"
  },
  inputAdornment: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.75rem",
    height: "100%",
    padding: 0,
    margin: 0,
    cursor: "pointer"
  }
});

export default styles;
