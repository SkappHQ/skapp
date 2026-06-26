import { Theme } from "@mui/material";

import { ZIndexEnums } from "~community/common/enums/CommonEnums";

const styles = (theme: Theme) => ({
  stackContainer: {
    padding: "0.5rem 0rem",
    width: "max-content",
    height: "4rem",
    background: theme.palette.grey[100],
    borderWidth: "0.063rem 0rem",
    borderStyle: "solid",
    borderBottomColor: theme.palette.grey[500],
    borderTopColor: theme.palette.grey[100],
    position: "relative",
    [theme.breakpoints.down("xl")]: {
      width: "max-content"
    }
  },
  boxContainer: (isDrawerToggled: boolean) => ({
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1.5,
    padding: "1.3rem 1rem",
    minWidth: "18rem",
    maxWidth: "18rem",
    background: theme.palette.grey[100],
    position: "sticky",
    left: 0,
    zIndex: ZIndexEnums.DEFAULT,
    [theme.breakpoints.down("lg")]: {
      flex: 0.5,
      minWidth: "18rem",
      maxWidth: "18rem"
    },
    ...(isDrawerToggled && {
      [theme.breakpoints.up("xl")]: { flex: 1.5 }
    }),
    borderRight: "0.063rem solid",
    borderColor: theme.palette.grey[200]
  }),
  fontHeaderStyles: {
    color: theme.palette.text.secondary
  },
  boxHeaderLabelStyles: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 0.5,
    minWidth: "4rem",
    maxWidth: "4rem",
    [theme.breakpoints.down("xl")]: {
      maxWidth: "5.9rem"
    }
  },
  fontHeaderLabelStyles: {
    color: theme.palette.text.secondary,
    textAlign: "center"
  }
});

export default styles;
