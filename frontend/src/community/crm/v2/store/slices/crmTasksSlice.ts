import { CrmTaskEntity } from "~community/crm/v2/types/CrmTypes";

export interface CrmTasksSlice {
  tasks: Record<number, CrmTaskEntity>;
  taskIds: number[];

  upsertTasks: (tasks: CrmTaskEntity[]) => void;
  upsertTask: (task: CrmTaskEntity) => void;
  removeTask: (taskId: number) => void;

  setTaskIds: (taskIds: number[]) => void;
  appendTaskIds: (taskIds: number[]) => void;
}
