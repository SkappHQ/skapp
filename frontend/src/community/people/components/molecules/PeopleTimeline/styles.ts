import { type Theme } from "@mui/material";

import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  outermostStack: {
    flexDirection: "column",
    marginTop: "1.25rem",
    width: "100%",
    height: "100%"
  },
  eventYearTypography: {
    fontWeight: 700,
    fontSize: "1.25rem",
    lineHeight: "1.875rem",
    marginBottom: "1.5rem"
  },
  eventContainer: {
    flexDirection: "column"
  },
  eventStack: {
    flexDirection: "row",
    alignItems: "center",
    height: "100%",
    width: "100%",
    gap: ".875rem"
  },
  iconContainerBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "1rem",
    margin: "0rem"
  },
  iconTopLine: {
    width: ".0625rem",
    height: "calc(calc(calc(100% - .5rem) / 2) - .5rem)",
    backgroundColor: theme.palette.grey[500]
  },
  iconDot: {
    borderRadius: "100%",
    width: "1rem",
    height: "1rem",
    border: `.1875rem solid ${theme.palette.grey[500]}`
  },
  iconBottomLine: {
    width: ".0625rem",
    height: "calc(calc(100% - .5rem) / 2)",
    backgroundColor: theme.palette.grey[500]
  },
  eventContainerStack: {
    backgroundColor: theme.palette.grey[50],
    borderRadius: ".25rem",
    padding: "1rem 1.25rem",
    width: "100%",
    alignItems: "center",
    marginBottom: ".5rem"
  },
  eventTitleTypographyWrapper: {
    width: "25rem"
  },
  displayDateStack: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: ".625rem",
    flexShrink: 0
  },
  displayDateTypography: {
    fontWeight: 500,
    fontSize: "1rem",
    lineHeight: "1.5rem"
  },
  lighterTextTypography: {
    fontWeight: 400,
    fontSize: "0.75rem",
    lineHeight: "1.125rem",
    color: theme.palette.grey[700]
  },
  eventTitleTypography: {
    fontWeight: 400,
    fontSize: "1rem",
    lineHeight: "1.5rem",
    marginLeft: "2rem"
  },
  eventDataStack: {
    flexDirection: { xs: "column", sm: "row" },
    gap: { xs: "0.625rem", sm: "0rem" },
    alignItems: "center",
    width: "100%",
    justifyContent: "space-between"
  },
  eventNameStack: {
    flexDirection: "row",
    gap: "1rem",
    width: "max-content",
    justifyContent: { xs: "flex-start", sm: "center" }
  },
  rightArrowBox: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  basicChip: {
    backgroundColor: theme.palette.notifyBadge.contrastText,
    borderRadius: "4rem",
    padding: ".625rem 1.25rem",
    fontWeight: 400,
    fontSize: ".875rem",
    lineHeight: "1rem"
  },
  eventCreatedByStack: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-end",
    gap: "0.125rem",
    alignSelf: "end"
  },
  createdByTypography: {
    fontWeight: 400,
    fontSize: "0.75rem",
    lineHeight: "1rem",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "8.75rem"
  }
});

export default styles;
