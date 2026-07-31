import { type Theme } from "@mui/material";

import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  tableHead: {
    borderTopLeftRadius: "0.625rem",
    borderTopRightRadius: "0.625rem"
  },
  tableHeaderCell: {
    border: "none"
  },
  tableContainer: {
    borderRadius: "0.625rem",
    maxHeight: "27.5rem",
    overflow: "auto"
  },
  tableWrapper: {
    backgroundColor: theme.palette.grey[100],
    borderRadius: "0.625rem",
    mt: "1rem"
  },
  cell: {
    backgroundColor: theme.palette.common.white,
    borderRadius: "9.375rem",
    padding: "0.5rem 1rem"
  },
  durationCell: {
    backgroundColor: theme.palette.common.white,
    borderRadius: "9.375rem",
    padding: "0.5rem 1rem",
    marginRight: "0.5rem"
  }
});

export default styles;
