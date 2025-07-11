import { SxProps, Theme } from "@mui/material";

import { ZIndexEnums } from "~community/common/enums/CommonEnums";

const styles = (theme: Theme) => ({
  stackStyle: {
    cursor: "default",
    zIndex: ZIndexEnums.TOAST,
    position: "fixed",
    top: "1.25rem",
    right: "1.25rem",
    "& .MuiPaper-root": { padding: 0, backgroundColor: "transparent" },
    "& .MuiSnackbarContent-action": {
      padding: 0,
      marginRight: 0
    }
  },
  toastContainer: (bgColor: string): SxProps<Theme> => ({
    flexDirection: "row",
    backgroundColor: bgColor,
    borderRadius: "0.5rem",
    padding: "1rem 0.1875rem 1rem 1rem ",
    display: "flex",
    alignItems: "center",
    width: "21.875rem",
    minHeight: "5rem"
  }),

  verticalDividerStyle: (color: string): SxProps<Theme> => ({
    background: color,
    width: "0.2rem",
    height: "auto",
    borderRadius: "2rem",
    border: 0,
    marginRight: "0.4rem"
  }),
  iconSection: (color: string): SxProps<Theme> => ({
    marginRight: "1rem",
    marginLeft: "0.5rem",
    color
  }),
  iconBoxStyle: {
    display: "block",
    alignSelf: "center"
  },
  textSection: {
    width: "100%"
  },
  titleStyle: {
    fontWeight: 600,
    fontSize: "0.9375rem",
    color: theme.palette.text.primary
  },
  descriptionStyle: {
    color: theme.palette.text.secondary,
    fontWeight: 300,
    fontSize: "0.75rem"
  }
});

export default styles;
