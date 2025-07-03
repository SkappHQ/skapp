import Drawer from "@mui/material/Drawer";
import { styled } from "@mui/material/styles";

import { DRAWER_ANIMATION_DURATION } from "./styles";

export const StyledDrawer = styled(Drawer)(({ theme, open }) => ({
  "&.MuiDrawer-docked": {
    [theme.breakpoints.up("lg")]: {
      width: open ? "17.75rem" : "3rem",
      height: "100dvh",
      transition: `width ${DRAWER_ANIMATION_DURATION} ease`
    }
  },
  "& .MuiDrawer-paper": {
    [theme.breakpoints.up("xs")]: {
      width: open ? "100%" : "0%",
      overflowY: "visible",
      overflowX: "hidden",
      transition: `width ${DRAWER_ANIMATION_DURATION} ease`,
      boxShadow:
        "0px 4px 10px 0px rgba(0, 0, 0, 0.06), 0px 40px 24px 0px rgba(0, 0, 0, 0.03), 0px 71px 28px 0px rgba(0, 0, 0, 0.01), 0px 110px 31px 0px rgba(0, 0, 0, 0)"
    },
    [theme.breakpoints.up("sm")]: {
      width: open ? "17.75rem" : "0rem"
    },
    [theme.breakpoints.up("lg")]: {
      width: open ? "17.75rem" : "3rem",
      "&:hover .MuiIconButton-root": {
        opacity: 1,
        visibility: "visible"
      }
    }
  }
}));
