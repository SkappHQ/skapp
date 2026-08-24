import { CrmTaskEntity, CrmTaskRecord } from "../types/CrmCommonTypes";

export const toTaskIds = (tasks: CrmTaskEntity[]): number[] => {
  const taskIds: number[] = [];
  for (const task of tasks) {
    if (task.id != null) {
      taskIds.push(task.id);
    }
  }
  return taskIds;
};

export const mergeTasks = (
  existing: CrmTaskRecord,
  incoming: CrmTaskEntity[]
): CrmTaskRecord => {
  const merged: CrmTaskRecord = { ...existing };
  for (const task of incoming) {
    if (task.id == null) continue;
    merged[task.id] = { ...merged[task.id], ...task };
  }
  return merged;
};

export const prependTaskId = (taskIds: number[], id: number): number[] =>
  taskIds.includes(id) ? taskIds : [id, ...taskIds];

export const removeTaskId = (taskIds: number[], id: number): number[] =>
  taskIds.filter((taskId) => taskId !== id);

export const removeTaskFromRecord = (
  tasks: CrmTaskRecord,
  id: number
): CrmTaskRecord => {
  if (!(id in tasks)) return tasks;
  const next = { ...tasks };
  delete next[id];
  return next;
};
