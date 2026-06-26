import { Theme } from "@mui/material";

const styles = (theme: Theme) => ({
  label: {
    fontWeight: 500,
    color: theme.palette.common.black,
    mb: "0.5rem"
  },
  inputBase: {
    backgroundColor: theme.palette.grey[100],
    padding: "0.75rem 1rem",
    borderRadius: "0.5rem",
    "& .MuiInputBase-input": {
      padding: "0rem"
    }
  }
});

export default styles;
