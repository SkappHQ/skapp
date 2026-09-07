import { UsersIcon } from "@rootcodelabs/skapp-ui";
import { ReactNode, SVGProps } from "react";

export interface ReportListItemType {
  id: string;
  Icon: (props: SVGProps<SVGSVGElement>) => ReactNode;
  labelKey: string;
}

export const REPORT_LIST: ReportListItemType[] = [
  {
    id: "headcount-summary",
    Icon: UsersIcon,
    labelKey: "headcountSummary"
  }
];
