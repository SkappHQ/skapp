import { Theme } from "@mui/material/styles";

export const styles = (theme: Theme) => ({
  stackContainer: {
    width: "100%",
    overflowX: "auto",
    position: "relative",
    "&::-webkit-scrollbar": {
      height: "0.4em",
      backgroundColor: "transparent",
      outline: "none"
    },
    "&::-webkit-scrollbar-track": {
      marginLeft: "15rem",
      backgroundColor: "rgba(0,0,0,.1)"
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(0,0,0,.2)",
      borderRadius: "2px"
    }
  },
  boxContainer: {
    maxWidth: "900px"
  },
  emptyScreenContainer: {
    display: "flex",
    justifyContent: "center",
    backgroundColor: theme.palette.grey[100]
  },
  paginationContainer: {
    pb: "0.938rem",
    backgroundColor: theme.palette.grey[100],
    borderRadius: "0rem 0rem 0.5rem 0.5rem"
  },
  divider: {
    color: theme.palette.grey.A100,
    my: "1rem"
  },
  buttonStyles: {
    mt: "1rem",
    mr: "1rem",
    p: "0.75rem 1rem",
    width: "12rem",
    fontSize: "1rem",
    fontWeight: 400,
    backgroundColor: "white",
    [theme.breakpoints.down("lg")]: {
      p: ".9375rem",
      width: "9.563rem",
      fontSize: ".875rem"
    },
    ".MuiButton-endIcon": {
      "svg path": {
        fill: "none"
      }
    }
  },
  headerStack: {
    padding: "0.5rem",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    backgroundColor: theme.palette.grey[100],
    borderTopLeftRadius: "0.5rem",
    borderTopRightRadius: "0.5rem",
    width: "100%"
  },
  filterButton: {
    p: "0.5rem 0.75rem",
    textTransform: "capitalize",
    lineHeight: "1.3125rem",
    height: "2rem",
    ml: "0.4rem",
    mb: "0.8rem"
  }
});
