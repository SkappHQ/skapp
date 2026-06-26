import { useMediaQuery, useTheme } from "@mui/material";

export const useScreenSizeRange = () => {
  const theme = useTheme();
  const isDesktopScreen = useMediaQuery(theme.breakpoints.between("xl", "2xl"));
  const isSmallDesktopScreen = useMediaQuery(
    theme.breakpoints.between("lg", "xl")
  );
  const isTabScreen = useMediaQuery(theme.breakpoints.between("md", "xl"));
  const isPhoneScreen = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallPhoneScreen = useMediaQuery("(max-width: 740px)");

  return {
    isDesktopScreen,
    isSmallDesktopScreen,
    isTabScreen,
    isPhoneScreen,
    isSmallPhoneScreen
  };
};
