import { type Theme } from "@mui/material";

const styles = (theme: Theme) => ({
  iconButtonStyles: {
    backgroundColor: theme.palette.grey[100],
    width: "2.5rem",
    height: "2.5rem",
    border: ".0625rem solid",
    borderColor: "grey.500"
  },
  selectButtonStyles: {
    border: ".0625rem solid",
    borderColor: "grey.500",
    fontWeight: "400",
    fontSize: ".875rem",
    py: ".5rem",
    px: "1rem",
    width: "max-content"
  },
  sortContainer: {
    backgroundColor: "common.white"
  },
  popperContainerStyles: {
    width: "16.25rem"
  },
  popperDateContainerStyles: {
    width: "20rem"
  }
});

export default styles;
