import { Theme } from "@mui/material";

const styles = (theme: Theme) => ({
  wrapper: {
    gap: "0.5rem",
    width: "100%"
  },
  container: {
    gap: "0.75rem",
    width: "100%"
  },
  asterisk: {
    color: theme.palette.error.contrastText
  },
  btnWrapper: {
    flexDirection: { xs: "column", sm: "row" },
    gap: "0.75rem",
    width: "100%"
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: "0.5rem",
    padding: "1rem",
    width: { xs: "100%", sm: "calc(50% - 0.375rem)" },
    height: "3.75rem",
    "&.Mui-default-button": {
      backgroundColor: theme.palette.grey[100],
      cursor: "pointer",
      "&:hover": {
        backgroundColor: theme.palette.grey[200],
        cursor: "pointer"
      }
    },
    "&.Mui-selected-button": {
      backgroundColor: theme.palette.secondary.main,
      border: `0.0625rem solid ${theme.palette.primary.dark}`,
      cursor: "pointer"
    },
    "&.Mui-error-button": {
      backgroundColor: theme.palette.grey[100],
      border: `0.0625rem solid ${theme.palette.error.contrastText}`,
      cursor: "pointer"
    },
    "&.Mui-disabled-button": {
      backgroundColor: theme.palette.grey[100],
      cursor: "not-allowed",
      pointerEvents: "none"
    }
  },
  btnText: {
    "&.Mui-default-button": {
      color: theme.palette.text.secondary,
      cursor: "pointer"
    },
    "&.Mui-selected-button": {
      color: theme.palette.primary.dark,
      cursor: "pointer"
    },
    "&.Mui-error-button": {
      color: theme.palette.text.secondary,
      cursor: "pointer"
    },
    "&.Mui-disabled-button": {
      color: theme.palette.grey.A100,
      cursor: "not-allowed",
      pointerEvents: "none"
    }
  },
  btnGroup: {
    flexDirection: "row",
    width: { xs: "100%", sm: "calc(50% - 0.375rem)" },
    height: "3.75rem"
  },
  halfBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem",
    height: "100%",
    width: "50%",
    "&.Mui-default-button": {
      backgroundColor: theme.palette.grey[100],
      cursor: "pointer",
      "&:hover": {
        backgroundColor: theme.palette.grey[200],
        cursor: "pointer"
      }
    },
    "&.Mui-selected-button": {
      backgroundColor: theme.palette.secondary.main,
      border: `0.0625rem solid ${theme.palette.primary.dark}`,
      cursor: "pointer"
    },
    "&.Mui-error-button": {
      backgroundColor: theme.palette.grey[100],
      border: `0.0625rem solid ${theme.palette.error.contrastText}`,
      cursor: "pointer"
    },
    "&.Mui-disabled-button": {
      backgroundColor: theme.palette.grey[100],
      cursor: "not-allowed",
      pointerEvents: "none"
    }
  },
  firstHalfBtn: {
    borderRight: `0.0625rem solid ${theme.palette.grey[500]}`,
    borderRadius: "0.5rem 0 0 0.5rem"
  },
  lastHalfBtn: {
    borderRadius: "0 0.5rem 0.5rem 0"
  }
});

export default styles;
