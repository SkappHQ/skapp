import { Theme } from "@mui/material";

const styles = (theme: Theme) => ({
  leaveDurationStack: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: "1rem",
    pb: "1rem"
  },
  leaveStateChip: {
    background: theme.palette.grey[100]
  },
  leaveDateChip: {
    background: theme.palette.grey[100],
    "& .MuiChip-label": {
      maxWidth: undefined
    }
  },
  timeStack: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "0.9375rem"
  },
  inputField: {
    pt: "1rem"
  },
  disabledInputFieldLabel: {
    color: theme.palette.text.disabled,
    fontWeight: theme.typography.label.fontWeight
  },
  disabledInputFieldValue: {
    "&& .MuiInputBase-input": {
      "&.Mui-disabled": {
        WebkitTextFillColor: theme.palette.grey[600],
        fontWeight: theme.typography.placeholder.fontWeight
      }
    }
  },
  readOnlyDateValue: {
    "& .MuiBox-root > .MuiTypography-root": {
      color: theme.palette.grey[600],
      fontWeight: theme.typography.placeholder.fontWeight
    }
  },
  button: {
    mt: "1rem"
  }
});

export default styles;
