import Drawer from "@mui/material/Drawer";
import { styled } from "@mui/material/styles";

export const StyledDrawer = styled(Drawer)(({ theme, open }) => ({
  "&.MuiDrawer-docked": {
    [theme.breakpoints.up("lg")]: {
      width: open ? "16.75rem" : "3rem",
      height: "100dvh",
      transition: "width 0.3s ease"
    }
  },
  "& .MuiDrawer-paper": {
    [theme.breakpoints.up("xs")]: {
      width: open ? "100%" : "0%",
      overflowY: "visible",
      transition: "width 0.3s ease",
      boxShadow: "0px 4px 10px 0px #0000000F"
    },
    [theme.breakpoints.up("sm")]: {
      width: open ? "22.5rem" : "0rem"
    },
    [theme.breakpoints.up("lg")]: {
      width: open ? "16.75rem" : "3rem",
      "&:hover .MuiIconButton-root": {
        opacity: 1,
        visibility: "visible"
      }
    }
  }
}));
