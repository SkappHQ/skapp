import { useEffect, useState } from "react";

import { useScreenSizeRange } from "~community/common/hooks/useScreenSizeRange";
import { useCommonStore } from "~community/common/stores/commonStore";

const useResponsiveCardSize = (pageSize: number) => {
  const [responsivePageSize, setResponsivePageSize] =
    useState<number>(pageSize);
  const [responsiveCardSize, setResponsiveCardSize] = useState<string>();
  const { isDesktopScreen, isTabScreen, isPhoneScreen } = useScreenSizeRange();
  const { isDrawerToggled } = useCommonStore((state) => ({
    isDrawerToggled: state.isDrawerExpanded
  }));

  useEffect(() => {
    setResponsivePageSize(
      (isDesktopScreen && isDrawerToggled) || (isTabScreen && !isDrawerToggled)
        ? (pageSize / 4) * 3
        : (isTabScreen && isDrawerToggled) ||
            (isPhoneScreen && !isDrawerToggled)
          ? pageSize / 2
          : isPhoneScreen && isDrawerToggled
            ? pageSize / 4
            : pageSize
    );
    setResponsiveCardSize(
      (isDesktopScreen && isDrawerToggled) || (isTabScreen && !isDrawerToggled)
        ? "32.83%"
        : (isTabScreen && isDrawerToggled) ||
            (isPhoneScreen && !isDrawerToggled)
          ? "49%"
          : isPhoneScreen && isDrawerToggled
            ? "98%"
            : "24.5%"
    );
  }, [isDesktopScreen, isTabScreen, isPhoneScreen, isDrawerToggled, pageSize]);

  return { responsivePageSize, responsiveCardSize };
};

export default useResponsiveCardSize;
