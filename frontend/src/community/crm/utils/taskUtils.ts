import { CrmTaskDetailType } from "~community/crm/types/CommonTypes";

import { isDueToday, isDueTomorrow, isOverdue } from "./taskValidations";

export interface GroupedTasks {
  overdue: CrmTaskDetailType[];
  dueToday: CrmTaskDetailType[];
  dueTomorrow: CrmTaskDetailType[];
  upcoming: CrmTaskDetailType[];
}

export const groupTasksByDueDate = (tasks: CrmTaskDetailType[]): GroupedTasks => {
  const overdue: CrmTaskDetailType[] = [];
  const dueToday: CrmTaskDetailType[] = [];
  const dueTomorrow: CrmTaskDetailType[] = [];
  const upcoming: CrmTaskDetailType[] = [];

  for (const task of tasks) {
    if (!task.dueAt) {
      upcoming.push(task);
    } else if (isOverdue(task.dueAt)) {
      overdue.push(task);
    } else if (isDueToday(task.dueAt)) {
      dueToday.push(task);
    } else if (isDueTomorrow(task.dueAt)) {
      dueTomorrow.push(task);
    } else {
      upcoming.push(task);
    }
  }

  return { overdue, dueToday, dueTomorrow, upcoming };
};
