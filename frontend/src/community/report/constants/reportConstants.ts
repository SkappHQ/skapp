import { IconName } from "~community/common/types/IconTypes";

export interface ReportListItemType {
  id: string;
  iconName: IconName;
  labelKey: string;
}

export const REPORT_LIST: ReportListItemType[] = [
  {
    id: "headcount-summary",
    iconName: IconName.HEADCOUNT_ICON,
    labelKey: "headcountSummary"
  }
];
