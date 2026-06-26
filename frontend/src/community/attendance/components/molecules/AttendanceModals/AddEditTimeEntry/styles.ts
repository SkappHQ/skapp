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
  button: {
    mt: "1rem"
  }
});

export default styles;
