import { Theme } from "@mui/material";

import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  wrapper: {
    borderRadius: "0.5rem",
    padding: "0.75rem",
    width: "100%"
  },
  rowOne: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.25rem"
  },
  rowTwo: {
    marginBottom: "0.5625rem"
  },
  rowThree: {
    flexDirection: { xs: "column", sm: "row" },
    justifyContent: "space-between",
    gap: "1.25rem"
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: { sm: "space-between" },
    gap: "0.5rem"
  },
  rightContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.5rem 1rem",
    border: `0.0625rem solid ${theme.palette.grey[200]}`,
    borderRadius: "3.125rem",
    cursor: "pointer"
  },
  wrapperStyles: {
    width: "max-content"
  },
  dropdownBtnStyles: {
    width: "max-content"
  },
  chip: {
    backgroundColor: theme.palette.greens.lighter,
    color: theme.palette.greens.darker,
    marginLeft: "-0.438rem",
    lineHeight: "1.313rem",
    zIndex: ZIndexEnums.DEFAULT
  },
  componentStyles: {
    ".MuiAvatarGroup-avatar": {
      border: `0.125rem solid ${theme.palette.trendChart.away}`
    }
  }
});

export default styles;
