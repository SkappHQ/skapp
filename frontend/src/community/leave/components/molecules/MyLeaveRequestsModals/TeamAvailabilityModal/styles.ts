import { Theme } from "@mui/material";

import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  wrapper: {
    gap: "1rem"
  },
  header: {
    flexDirection: "row",
    gap: "1.25rem"
  },
  column: {
    color: theme.palette.text.secondary
  },
  date: {
    flexDirection: "row",
    width: "12.5rem",
    gap: "1.25rem"
  },
  awayMembers: {
    flexDirection: "row",
    justifyContent: "flex-start",
    width: "100%"
  },
  holidayChip: {
    borderColor: theme.palette.grey.A100,
    color: theme.palette.grey.A100,
    fontSize: "0.75rem",
    fontWeight: 400
  },
  awayChip: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText
  },
  availableChip: {
    backgroundColor: theme.palette.greens.lighter,
    color: theme.palette.greens.darker
  },
  componentStyles: {
    ".MuiAvatarGroup-avatar": {
      border: `0.125rem solid ${theme.palette.trendChart.away}`
    }
  },
  body: {
    gap: "1rem",
    maxHeight: "22.75rem",
    paddingRight: "0.25rem",
    overflow: "auto"
  },
  row: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    minHeight: "3.75rem",
    gap: "1.25px rem",
    padding: "0.5rem 1.25rem",
    backgroundColor: theme.palette.grey[100],
    borderRadius: "0.5rem"
  }
});

export default styles;
