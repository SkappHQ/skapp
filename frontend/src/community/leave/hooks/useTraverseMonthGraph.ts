import { DateTime } from "luxon";
import { useEffect, useState } from "react";

import { GraphTraverseTypes } from "~community/leave/types/TeamLeaveAnalyticsTypes";

export const useTraverseMonthGraph = (months: string[]) => {
  const CURRENT_MONTHS = DateTime.now().toFormat("MMM");
  const [monthIndex, setMonthIndex] = useState<GraphTraverseTypes>({
    min: 0,
    max: 5
  });

  const moveChart = (direction: "LEFT" | "RIGHT"): void => {
    if (direction === "LEFT") {
      setMonthIndex((prev) => ({
        min: prev.min - 6,
        max: prev.max - 6
      }));
    }
    if (direction === "RIGHT") {
      setMonthIndex((prev) => ({
        min: prev.min + 6,
        max: prev.max + 6
      }));
    }
  };

  useEffect(() => {
    setMonthIndex({
      min: months?.slice(0, 5)?.includes(CURRENT_MONTHS) ? 0 : 6,
      max: months?.slice(0, 5)?.includes(CURRENT_MONTHS) ? 5 : 11
    });
  }, [CURRENT_MONTHS, months]);

  return { monthIndex, moveChart };
};
