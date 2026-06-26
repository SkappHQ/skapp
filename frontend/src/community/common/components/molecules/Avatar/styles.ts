import { type Theme } from "@mui/material";

import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  wrapper: {
    flexDirection: "column"
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative"
  },
  iconWrapper: {
    position: "absolute",
    left: "4.375rem",
    top: "5rem",
    transform: "translateY(-50%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "2rem",
    height: "2rem",
    borderRadius: "50%",
    backgroundColor: theme.palette.secondary.main,
    cursor: "pointer",
    zIndex: ZIndexEnums.DEFAULT
  },
  defaultAvatarContainer: {
    backgroundColor: theme.palette.grey[200],
    border: "none",
    containerType: "size"
  },
  defaultAvatarTypography: {
    color: theme.palette.grey[400],
    fontSize: "42cqw",
    fontWeight: 500
  }
});

export default styles;
