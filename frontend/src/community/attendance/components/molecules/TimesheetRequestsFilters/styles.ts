import { Theme } from "@mui/material";

const styles = (theme: Theme) => ({
  stackContainer: {
    pb: "1.25rem",
    backgroundColor: theme.palette.grey[100],
    pt: "1.25rem",
    px: "0.625rem",
    borderTopLeftRadius: "0.5rem",
    borderTopRightRadius: "0.5rem"
  },
  fontStyles: {
    pr: "1rem"
  }
});

export default styles;
