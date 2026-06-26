import { Theme } from "@mui/material";

interface Props {
  primaryButtonStyles: object;
  titleText: object;
}

const styles = (theme: Theme): Props => ({
  primaryButtonStyles: {
    borderRadius: "3.125rem",
    padding: "0.75rem 1.25rem",
    height: "2.8125rem",
    width: "13.9375rem"
  },
  titleText: {
    color: theme.palette.common.black
  }
});

export default styles;
