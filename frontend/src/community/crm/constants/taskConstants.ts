import { CrmPriorityEnum } from "~community/crm/enums/common";

export const TASK_SEARCH_DEBOUNCE_DELAY = 500;

export const priorityOptions = [
  {
    label: "Low",
    key: "low",
    value: CrmPriorityEnum.LOW,
    backgroundColor: "bg-semantic-green-background",
    textColor: "text-semantic-green-text"
  },
  {
    label: "Medium",
    key: "medium",
    value: CrmPriorityEnum.MEDIUM,
    backgroundColor: "bg-semantic-amber-background",
    textColor: "text-semantic-amber-text"
  },
  {
    label: "High",
    key: "high",
    value: CrmPriorityEnum.HIGH,
    backgroundColor: "bg-semantic-red-background",
    textColor: "text-semantic-red-text"
  }
];
