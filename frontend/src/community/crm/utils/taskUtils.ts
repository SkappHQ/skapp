import { CrmTaskDetailType } from "~community/crm/types/CommonTypes";

import { CrmTaskTabEnum } from "../enums/common";
import { isDueToday, isDueTomorrow, isOverdue } from "./taskValidations";

export interface GroupedTasks {
  overdue: CrmTaskDetailType[];
  dueToday: CrmTaskDetailType[];
  dueTomorrow: CrmTaskDetailType[];
  upcoming: CrmTaskDetailType[];
}

export const groupTasksByDueDate = (
  tasks: CrmTaskDetailType[]
): GroupedTasks => {
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

export const getTaskGroups = (
  tasks: CrmTaskDetailType[],
  tab: CrmTaskTabEnum,
  userId: number | undefined
): GroupedTasks => {
  const filteredTasks =
    tab === CrmTaskTabEnum.MY_TASKS
      ? tasks.filter((task) => task.owner.employeeId === userId)
      : tasks;
  return groupTasksByDueDate(filteredTasks);
};
