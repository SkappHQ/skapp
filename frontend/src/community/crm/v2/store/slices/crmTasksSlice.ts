import { CrmTaskEntity } from "~community/crm/types/CrmTypes";

export interface CrmTasksSlice {
  tasks: Record<number, CrmTaskEntity>;
  taskIds: number[];

  setTasks: (tasks: CrmTaskEntity[], currentPage?: number) => void;
  upsertTasks: (tasks: CrmTaskEntity[]) => void;
  upsertTask: (task: CrmTaskEntity) => void;
  removeTask: (taskId: number) => void;
}
