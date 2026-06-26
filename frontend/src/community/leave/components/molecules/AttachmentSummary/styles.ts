import { Theme } from "@mui/material";

import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  wrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    gap: "0.5rem"
  },
  chip: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    height: "2.5rem",
    padding: "0.75rem 1.25rem",
    borderRadius: "4rem",
    width: "fit-content",
    ".MuiChip-root": {
      backgroundColor: theme.palette.grey[100]
    },
    ".MuiChip-icon": {
      margin: "0rem"
    },
    ".MuiChip-label": {
      marginY: "auto",
      padding: "0rem",
      color: theme.palette.grey[400]
    },
    ".MuiChip-deleteIcon": {
      margin: "0rem"
    }
  }
});

export default styles;
