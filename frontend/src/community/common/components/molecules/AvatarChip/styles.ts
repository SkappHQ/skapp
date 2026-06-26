import { Theme } from "@mui/material";

const styles = (theme: Theme) => ({
  avatar: {
    width: "2.25rem",
    height: "2.25rem"
  },
  chip: (isNotEllipsis: boolean) => ({
    display: "flex",
    position: "relative",
    color: theme.palette.text.secondary,
    fontSize: "0.875rem",
    backgroundColor: "common.white",
    height: "100%",
    p: "0.125rem",
    borderRadius: "3.125rem",
    textOverflow: "ellipsis",
    "& .MuiChip-avatar": {
      width: "2.25rem",
      height: "2.25rem",
      margin: 0,
      borderRadius: "50%",
      backgroundColor: "common.white"
    },
    "& .MuiChip-label": {
      pl: "0.5rem",
      pr: "0.875rem",
      ml: "0.25rem",
      marginRight: "0.625rem",
      whiteSpace: "nowrap",
      overflow: isNotEllipsis ? "visible" : "hidden !important",
      textOverflow: isNotEllipsis ? "clip" : "ellipsis",
      maxWidth: "100%"
    }
  }),
  avatarImage: {
    "& .MuiAvatar-img": {
      borderRadius: "50%",
      padding: "0.125rem",
      backgroundColor: theme.palette.common.white
    }
  }
});

export default styles;
