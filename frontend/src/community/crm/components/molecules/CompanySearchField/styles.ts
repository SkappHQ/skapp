import { alpha, type Theme } from "@mui/material/styles";

const styles = (theme: Theme) => ({
  wrapper: {
    position: "relative",
    width: "100%"
  },
  label: {
    color: theme.palette.common.black,
    fontWeight: 500
  },
  inputPaper: {
    mt: "0.5rem",
    height: "3rem",
    borderRadius: "0.5rem",
    overflow: "visible",
    display: "flex",
    alignItems: "center",
    bgcolor: theme.palette.grey[100],
    border: "none",
    boxShadow: "none",
    px: "0.75rem"
  },
  inputBase: {
    flex: 1,
    fontSize: "1rem",
    fontWeight: 400,
    "& .MuiInputBase-input": {
      p: "0.7813rem 0 0.7813rem 1rem",
      "&::placeholder": {
        color: theme.palette.text.secondary,
        opacity: 1
      }
    }
  },
  searchIconWrapper: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer"
  },
  dropdownPaper: {
    position: "absolute",
    top: "calc(100% + 0.25rem)",
    left: 0,
    right: 0,
    zIndex: 1300,
    borderRadius: "0.5rem",
    overflow: "hidden",
    pt: "0.5rem",
    pb: 0,
    maxHeight: "16rem",
    overflowY: "auto"
  },
  noResultsText: {
    px: "1rem",
    py: "0.625rem",
    color: theme.palette.text.secondary,
    fontSize: "0.875rem"
  },
  optionItem: {
    px: "1rem",
    py: "0.625rem",
    cursor: "pointer",
    fontSize: "0.9375rem",
    color: theme.palette.common.black,
    "&:hover": { bgcolor: theme.palette.grey[100] }
  },
  addCompanyRow: {
    px: "1rem",
    py: "0.75rem",
    cursor: "pointer",
    color: theme.palette.primary.main,
    fontSize: "0.9375rem",
    fontWeight: 500,
    bgcolor: alpha(theme.palette.primary.main, 0.08),
    "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.14) }
  }
});

export default styles;
