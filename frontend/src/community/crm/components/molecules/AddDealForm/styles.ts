import { Theme } from "@mui/material";

import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  wrapper: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: "1.5rem"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem"
  },
  title: {
    fontSize: "1.25rem",
    fontWeight: 700,
    lineHeight: "1.75rem",
    color: theme.palette.text.primary
  },
  closeButton: {
    width: "36px",
    height: "36px",
    backgroundColor: "#E4E4E7",
    borderRadius: "65px",
    "&:hover": {
      backgroundColor: "#D4D4D8"
    }
  },
  content: {
    display: "flex",
    flexDirection: "row",
    gap: "1.5rem",
    flex: 1
  },
  leftColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "0.625rem",
    width: "637px"
  },
  rightColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    width: "296px"
  },
  statusDropdown: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: "0.75rem",
    gap: "0.25rem",
    width: "219px",
    height: "48px",
    backgroundColor: "#F4F4F5",
    borderRadius: "0.5rem",
    cursor: "pointer"
  },
  statusDot: (color: string) => ({
    width: "0.5rem",
    height: "0.5rem",
    borderRadius: "50%",
    backgroundColor: color
  }),
  statusText: {
    fontSize: "0.875rem",
    fontWeight: 400,
    color: theme.palette.text.primary,
    flex: 1
  },
  statusMenu: {
    "& .MuiPaper-root": {
      borderRadius: "0.5rem",
      border: `1px solid ${theme.palette.divider}`,
      boxShadow: theme.shadows[2],
      minWidth: "13.6875rem"
    }
  },
  statusMenuItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 0.75rem"
  },
  statusMenuText: {
    fontSize: "0.875rem",
    fontWeight: 400,
    color: theme.palette.text.primary
  },
  detailsList: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: "0.75rem",
    gap: "0.75rem",
    border: "1px solid #E5E7EB",
    borderRadius: "0.5rem",
    alignSelf: "stretch"
  },
  detailRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    alignSelf: "stretch",
    width: "100%",
    height: "2.25rem",
    justifyContent: "space-between"
  },
  detailLabel: {
    fontSize: "0.875rem",
    fontWeight: 400,
    color: theme.palette.text.primary
  },
  detailValue: {
    fontSize: "0.875rem",
    fontWeight: 400,
    color: theme.palette.text.secondary
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    paddingTop: "1.5rem"
  },
  submitButton: {
    textTransform: "none",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    gap: "0.5rem",
    padding: "0.5rem 1.25rem",
    backgroundColor: theme.palette.primary.main,
    "&:hover": {
      backgroundColor: theme.palette.primary.dark
    }
  }
});

export default styles;
