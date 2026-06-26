import { type Theme } from "@mui/material";

import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  tableHead: {
    borderTopLeftRadius: "0.625rem",
    borderTopRightRadius: "0.625rem"
  },
  tableHeaderCellStyles: {
    border: "none"
  },
  tableContainer: {
    borderRadius: "0.625rem",
    maxHeight: "27.5rem",
    overflow: "auto"
  },
  avatarChip: {
    backgroundColor: theme.palette.grey[100],
    color: "common.black",
    height: "2.5rem",
    mb: ".1875rem",
    display: "flex",
    justifyContent: "start",
    maxWidth: "fit-content"
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
  },
  editIconBtn: {
    bgcolor: theme.palette.grey[100],
    height: "2.25rem",
    p: "0.75rem 1.125rem"
  },
  deleteIconBtn: {
    bgcolor: theme.palette.grey[100],
    height: "2.25rem",
    p: "0.75rem 1.2081rem",
    ml: 0.25
  },
  tableWrapper: {
    bgcolor: theme.palette.grey[100],
    borderRadius: "0.625rem",
    mt: "1rem"
  }
});

export default styles;
