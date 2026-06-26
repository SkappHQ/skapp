import { Theme } from "@mui/material";

const styles = (theme: Theme) => ({
  avatarGroup: (onClick: boolean) => ({
    cursor: onClick ? "pointer" : "default"
  }),
  avatar: {
    padding: "0rem",
    marginLeft: "-3rem",
    height: "2.4rem",
    width: "2.4rem",
    backgroundColor: theme.palette.grey[300]
  },
  avatarHasStyledBadge: {
    "&.MuiAvatar-root": {
      border: `2px solid ${theme.palette.error.contrastText}`
    }
  },
  defaultAvatar: {
    width: "2.4rem",
    height: "2.4rem",
    backgroundColor: theme.palette.grey[200],
    containerType: "size",
    borderColor: theme.palette.grey[200]
  },
  defaultAvatarHasStyledBadge: {
    borderColor: theme.palette.common.white
  },
  defaultAvatarTypography: {
    color: theme.palette.grey[400],
    fontSize: "0.875rem",
    fontWeight: 500
  },
  hoverAvatarModalWrapper: {
    backgroundColor: "common.white",
    width: "15.75rem",
    borderRadius: "0.75rem",
    overflow: "hidden",
    boxShadow: `0rem 0.25rem 1.25rem ${theme.palette.grey.A200}`,
    px: "1.25rem",
    py: "1rem"
  },
  morningHalfDay: {
    overflow: "initial",
    "&.MuiAvatar-root": {
      padding: "0.125rem",
      backgroundImage: `linear-gradient(90deg, red 50%, white 50%)`,
      "& .MuiAvatar-img": {
        borderRadius: "50%",
        padding: "0.125rem",
        backgroundColor: theme.palette.common.white
      }
    }
  },
  eveningHalfDay: {
    overflow: "initial",
    "&.MuiAvatar-root": {
      padding: "0.125rem",
      backgroundImage: `linear-gradient(90deg, white 50%, red 50%)`,
      "& .MuiAvatar-img": {
        borderRadius: "50%",
        padding: "0.125rem",
        backgroundColor: theme.palette.common.white
      }
    }
  }
});

export default styles;
