import { Theme } from "@mui/material";

const styles = (theme: Theme) => ({
  iconStyles: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    backgroundColor: theme.palette.common.white,
    borderRadius: "9.375rem",
    padding: "0.5rem 1rem"
  }
});

export default styles;
