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
  editIconBtn: {
    backgroundColor: theme.palette.grey[100],
    height: "2.25rem",
    p: "0.75rem 1.125rem"
  },
  tableWrapper: {
    backgroundColor: theme.palette.grey[100],
    borderRadius: "0.625rem",
    mt: "1rem"
  }
});

export default styles;
