import { useCallback, useState } from "react";

import { TABLE_CONTAINER_WIDTH_OFFSET } from "~community/crm/constants/dealConstants";

export const useContainerWidth = (offset: number = TABLE_CONTAINER_WIDTH_OFFSET) => {
  const [width, setWidth] = useState(0);

  const containerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node) {
        setWidth(node.getBoundingClientRect().width - offset);
      }
    },
    [offset]
  );

  return [containerRef, width] as const;
};
