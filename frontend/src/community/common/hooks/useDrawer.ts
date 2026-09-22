import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import {
  MediaQueries,
  useMediaQuery
} from "~community/common/hooks/useMediaQuery";
import { useCommonStore } from "~community/common/stores/commonStore";

const useDrawer = () => {
  const { isDrawerExpanded, setIsDrawerExpanded, setExpandedDrawerListItem } =
    useCommonStore(
      useShallow((state) => ({
        isDrawerExpanded: state.isDrawerExpanded,
        setIsDrawerExpanded: state.setIsDrawerExpanded,
        setExpandedDrawerListItem: state.setExpandedDrawerListItem
      }))
    );

  const queryMatches = useMediaQuery();
  const isBelow1024 = queryMatches(MediaQueries.BELOW_1024);

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
