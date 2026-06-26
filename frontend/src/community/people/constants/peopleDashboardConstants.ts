import { theme } from "~community/common/theme/theme";

export const employmentBreakdownChartTypeLegendItems = [
  { color: theme.palette.graphColors.yellow, label: "Intern" },
  { color: theme.palette.graphColors.pink, label: "Contract" },
  { color: theme.palette.graphColors.green, label: "Permanent" }
];

export const employmentBreakdownChartAllocationLegendItems = [
  { color: theme.palette.graphColors.yellow, label: "Full Time" },
  { color: theme.palette.graphColors.pink, label: "Part Time" }
];

export const employmentBreakdownGraphTypes = {
  TYPE: { label: "Type", value: "TYPE" },
  ALLOCATION: { label: "Allocation", value: "ALLOCATION" }
};

export const employeeStatusTypes = {
  ACTIVE: { label: "Active", value: "ACTIVE" },
  PENDING: { label: "Pending", value: "PENDING" }
};
