import {
  CrmPriorityEnum,
  CrmTaskTabEnum
} from "~community/crm/enums/common";

export const TASK_SEARCH_DEBOUNCE_DELAY = 500;

export const SALES_REP_RESTRICTED_TASK_TABS = [CrmTaskTabEnum.TEAM_TASKS];

export const PRIORITY_OPTIONS = [
  {
    key: "low",
    value: CrmPriorityEnum.LOW,
    backgroundColor: "bg-semantic-green-background",
    textColor: "text-semantic-green-text"
  },
  {
    key: "medium",
    value: CrmPriorityEnum.MEDIUM,
    backgroundColor: "bg-semantic-amber-background",
    textColor: "text-semantic-amber-text"
  },
  {
    key: "high",
    value: CrmPriorityEnum.HIGH,
    backgroundColor: "bg-semantic-red-background",
    textColor: "text-semantic-red-text"
  }
];
