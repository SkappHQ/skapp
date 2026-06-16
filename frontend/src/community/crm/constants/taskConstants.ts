import { CrmPriorityEnum } from "~community/crm/enums/common";

export const TASK_SEARCH_DEBOUNCE_DELAY = 500;

export const TASK_TAB_IDS = {
  MY_TASKS: "my-tasks",
  TEAM_TASKS: "team-tasks",
  COMPLETED_TASKS: "completed-tasks"
}

export const SALES_REP_RESTRICTED_TASK_TABS = [
  TASK_TAB_IDS.TEAM_TASKS
];

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
