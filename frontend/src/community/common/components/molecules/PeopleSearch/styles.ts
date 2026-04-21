import { Theme } from "@mui/material";

const styles = (theme: Theme) => ({
  wrapper: {
    width: "100%"
  },
  label: {
    fontWeight: "500",
    fontSize: "1rem",
    mb: "0.625rem"
  },
  asterisk: {
    color: theme.palette.error.contrastText
  },
  paper: {
    p: "0.5rem 0.9375rem",
    display: "flex",
    alignItems: "center",
    borderRadius: "0.5rem",
    "&:focus-within": {
      outline: `0.125rem solid ${theme.palette.common.black}`,
      outlineOffset: "-0.125rem"
    }
  },
  inputBase: {
    flex: 1,
    "& input::placeholder": {
      fontSize: "1rem",
      color: theme.palette.text.secondary,
      opacity: 1
    }
  },
  error: {
    color: theme.palette.error.contrastText,
    mt: "0.5rem"
  },
  suggestionBox: {
    borderRadius: "0.75rem",
    maxHeight: "11.25rem",
    overflowY: "auto",
    overflowX: "hidden",
    width: "100%"
  },
  noSearchResultText: {
    p: "1.25rem"
  },
  suggestion: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    py: "0.5rem",
    "&:hover": {
      cursor: "pointer",
      borderRadius: "0.75rem"
    }
  },
  chip: {
    cursor: "pointer",
    maxWidth: "fit-content"
  }
});

export default styles;
