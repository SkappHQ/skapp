export const CLOCK_IN_OUT_CHART_SHIFT_DAYS = 3;
export const CLOCK_IN_OUT_CHART_INITIAL_X = 2;
export const LATE_ARRIVALS_CHART_SHIFT_DAYS = 5;
export const WORK_HOUR_TREND_SHIFT_DAYS = 15;

export const GRAPH_RIGHT = "right";
export const GRAPH_LEFT = "left";

export const clockInOutGraphTypes = {
  CLOCKIN: { label: "Clock In", value: "CLOCK_IN" },
  CLOCKOUT: { label: "Clock Out", value: "CLOCK_OUT" }
};

export const lateArrivalsGraphTypes = {
  WEEKLY: { label: "Weekly", value: "WEEKLY" },
  MONTHLY: { label: "Monthly", value: "MONTHLY" }
};
