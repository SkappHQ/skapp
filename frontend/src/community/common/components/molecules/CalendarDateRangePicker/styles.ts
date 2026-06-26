import { Theme } from "@mui/material";

import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  wrapper: {
    gap: "12px"
  },
  asterisk: {
    color: theme.palette.error.contrastText
  },
  staticDatePicker: {
    "&.MuiPickersLayout-root": {
      backgroundColor: theme.palette.grey[50],
      borderRadius: "12px"
    }
  },
  leftArrowIcon: {
    "&.Mui-disabled": {
      visibility: "hidden"
    }
  },
  rightArrowIcon: {
    "&.Mui-disabled": {
      visibility: "hidden"
    }
  },
  fieldsWrapper: {
    width: "100%",
    flexDirection: "row",
    gap: "0.75rem"
  },
  field: {
    alignItems: "center",
    justifyItems: "center",
    width: "100%",
    padding: "18px 20px",
    borderRadius: "8px",
    backgroundColor: theme.palette.grey[100],
    color: theme.palette.text.secondary
  },
  error: { color: theme.palette.error.contrastText }
});

export default styles;
