import Drawer from "@mui/material/Drawer";
import { styled } from "@mui/material/styles";

import { DRAWER_ANIMATION_DURATION } from "./styles";

interface StyledDrawerProps {
  isBelow600: boolean;
  isBelow1024: boolean;
}

export const StyledDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== "isBelow600" && prop !== "isBelow1024"
})<StyledDrawerProps>(({ open, isBelow600, isBelow1024 }) => {
  const getDrawerWidth = () => {
    if (isBelow600) return open ? "100%" : "0%";
    if (isBelow1024) return open ? "17.75rem" : "0rem";
    return open ? "17.75rem" : "4.6rem";
  };

  return {
    "&.MuiDrawer-docked": isBelow600
      ? {}
      : {
          width: getDrawerWidth(),
          height: "100dvh",
          transition: `width ${DRAWER_ANIMATION_DURATION} ease`
        },
    "& .MuiDrawer-paper": {
      overflowY: "visible",
      overflowX: "hidden",
      transition: `width ${DRAWER_ANIMATION_DURATION} ease`,
      boxShadow:
        "0px 4px 10px 0px rgba(0, 0, 0, 0.06), 0px 40px 24px 0px rgba(0, 0, 0, 0.03), 0px 71px 28px 0px rgba(0, 0, 0, 0.01), 0px 110px 31px 0px rgba(0, 0, 0, 0)",
      width: getDrawerWidth(),
      ...(!isBelow1024 && {
        "&:hover .MuiIconButton-root": {
          opacity: 1,
          visibility: "visible"
        }
      })
    }
  };
});
