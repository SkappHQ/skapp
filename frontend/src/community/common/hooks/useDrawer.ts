import { useEffect } from "react";

import { useCommonStore } from "~community/common/stores/commonStore";

const useDrawer = (isBelow1024?: boolean) => {
  const { isDrawerExpanded, setIsDrawerExpanded, setExpandedDrawerListItem } =
    useCommonStore((state) => ({
      isDrawerExpanded: state.isDrawerExpanded,
      setIsDrawerExpanded: state.setIsDrawerExpanded,
      setExpandedDrawerListItem: state.setExpandedDrawerListItem
    }));

  useEffect(() => {
    if (isBelow1024) {
      setIsDrawerExpanded(false);
    }
  }, [isBelow1024, setIsDrawerExpanded]);

  const handleDrawer = () => {
    setExpandedDrawerListItem!("");
    setIsDrawerExpanded(!isDrawerExpanded);
  };

  return { handleDrawer };
};

export default useDrawer;
