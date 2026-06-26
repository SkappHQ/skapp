import { Theme } from "@mui/material";

const styles = (theme: Theme) => ({
  leaveDurationStack: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: "1rem"
  },
  leaveStateChip: {
    background: theme.palette.grey[100]
  },
  leaveDateChip: {
    background: theme.palette.grey[100],
    "& .MuiChip-label": {
      maxWidth: undefined
    }
  }
});

export default styles;
