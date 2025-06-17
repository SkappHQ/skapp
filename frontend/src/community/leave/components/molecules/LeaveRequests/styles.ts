import { Theme } from "@mui/material";

const styles = (theme: Theme) => ({
  filterStackStyles: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: "0.5rem",
    columnGap: "0.2rem",
    marginTop: "0.75rem"
  },
  filterChipButtonStyles: {
    paddingX: "0.5rem",
    textTransform: "capitalize",
    lineHeight: "1.3125rem",
    height: "2rem"
  },
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
