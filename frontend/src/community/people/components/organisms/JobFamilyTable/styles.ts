import { Theme } from "@mui/material";

import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  wrapper: {
    backgroundColor: theme.palette.grey[100],
    maxHeight: "53vh",
    borderRadius: "0.625rem",
    mt: "1rem",
    mb: { xs: "6rem", lg: "0rem" }
  },
  tableHeadStyles: {
    borderTopLeftRadius: "0.625rem",
    borderTopRightRadius: "0.625rem",
    paddingTop: "0.625rem"
  },
  tableHeaderCellStyles: {
    border: "none",
    padding: "0.75rem 0.75rem 0.875rem 0.75rem"
  },
  tableContainerStyles: {
    borderRadius: "0.625rem"
  },
  avatarChip: {
    backgroundColor: theme.palette.grey[100],
    color: theme.palette.common.black,
    height: "2.5rem"
  },
  avatarGroup: {
    ".MuiAvatarGroup-avatar": {
      backgroundColor: theme.palette.grey[100],
      color: theme.palette.primary.dark,
      fontSize: "0.875rem",
      height: "2.5rem",
      width: "2.5rem",
      fontWeight: 400,
      flexDirection: "row-reverse"
    }
  },
  editIconBtn: {
    backgroundColor: theme.palette.grey[100],
    height: "2.25rem",
    p: "0.75rem 1.125rem"
  },
  deleteIconBtn: {
    backgroundColor: theme.palette.grey[100],
    height: "2.25rem",
    p: "0.75rem 1.2081rem",
    ml: 0.25
  }
});

export default styles;
