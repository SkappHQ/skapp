import { useEffect } from "react";

import {
  MediaQueries,
  useMediaQuery
} from "~community/common/hooks/useMediaQuery";
import { useCommonStore } from "~community/common/stores/commonStore";

const useDrawer = () => {
  const { isDrawerExpanded, setIsDrawerExpanded, setExpandedDrawerListItem } =
    useCommonStore((state) => ({
      isDrawerExpanded: state.isDrawerExpanded,
      setIsDrawerExpanded: state.setIsDrawerExpanded,
      setExpandedDrawerListItem: state.setExpandedDrawerListItem
    }));

  const queryMatches = useMediaQuery();
  const isBelow1024 = queryMatches(MediaQueries.BELOW_1024);

  // Below the desktop breakpoint the drawer is opened from the AppBar
  // hamburger, so collapse it whenever the viewport crosses that threshold.
  useEffect(() => {
    if (isBelow1024) {
      setIsDrawerExpanded(false);
    }
  }, [isBelow1024, setIsDrawerExpanded]);

  const handleDrawer = () => {
    setExpandedDrawerListItem!("");
    setIsDrawerExpanded(!isDrawerExpanded);
  };

  return { handleDrawer, isDrawerExpanded, isBelow1024 };
};

export default useDrawer;
