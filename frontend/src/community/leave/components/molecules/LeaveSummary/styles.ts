import { Theme } from "@mui/material";

import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    width: "100%"
  },
  container: {
    display: "flex",
    flexDirection: { xs: "row" },
    flexWrap: "wrap",
    gap: "1rem"
  },
  row: {
    display: "flex",
    flexDirection: { xs: "row" },
    flexWrap: "wrap",
    alignItems: "center",
    minWidth: "20rem",
    gap: { xs: "0.5rem" }
  },
  label: {
    width: { xs: "6.25rem" }
  },
  chipWrapper: {
    display: "flex",
    flexDirection: { xs: "row" },
    flexWrap: "wrap",
    gap: "0.5rem"
  },
  chip: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    height: "2.5rem",
    padding: "0.75rem 1.25rem",
    borderRadius: "3.125rem",
    width: "fit-content",
    ".MuiChip-root": {
      backgroundColor: theme.palette.grey[100]
    },
    ".MuiChip-icon": {
      margin: "0rem"
    },
    ".MuiChip-label": {
      marginY: "auto",
      padding: "0rem"
    }
  },
  chipStyles: {
    backgroundColor: theme.palette.grey[100]
  },
  avatarGroup: {
    ".MuiAvatarGroup-avatar": {
      bgcolor: theme.palette.grey[100],
      color: theme.palette.primary.dark,
      fontSize: "0.875rem",
      height: "2.5rem",
      width: "2.5rem",
      fontWeight: 400,
      flexDirection: "row-reverse"
    }
  }
});

export default styles;
