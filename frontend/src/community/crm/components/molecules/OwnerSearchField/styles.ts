import { type Theme } from "@mui/material";

const styles = (theme: Theme) => ({
  wrapper: {
    position: "relative",
    width: "100%"
  },
  label: {
    color: theme.palette.common.black,
    fontWeight: 500
  },
  fieldPaper: {
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
  selectedChip: {
    bgcolor: theme.palette.common.white,
    borderRadius: "3.125rem",
    height: "2.25rem",
    px: "0.5rem",
    maxWidth: "100%"
  },
  selectedChipAvatar: {
    width: "1.75rem",
    height: "1.75rem"
  },
  selectedChipLabel: {
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  selectedChipRemove: {
    p: "0.25rem",
    color: theme.palette.grey[600],
    "&:hover": { bgcolor: theme.palette.grey[200] }
  },
  inputBase: {
    flex: 1,
    fontSize: "1rem",
    fontWeight: 400,
    "& .MuiInputBase-input": {
      p: 0,
      "&::placeholder": {
        color: theme.palette.text.secondary,
        opacity: 1
      }
    }
  },
  searchIconWrapper: {
    display: "flex",
    alignItems: "center",
    color: theme.palette.text.secondary,
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
    py: "0.5rem",
    maxHeight: "16rem",
    overflowY: "auto"
  },
  noResultsText: {
    px: "1rem",
    py: "0.625rem",
    color: theme.palette.text.secondary,
    fontSize: "0.875rem"
  },
  ownerRow: {
    px: "1rem",
    py: "0.5rem",
    cursor: "pointer",
    "&:hover": { bgcolor: theme.palette.grey[100] }
  },
  ownerName: {
    fontSize: "0.9375rem",
    color: theme.palette.common.black
  }
});

export default styles;
