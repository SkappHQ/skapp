import { CrmTaskType } from "./CommonTypes";

export type { CrmTaskType };

export interface CrmTasksResponseType {
  items: CrmTaskType[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}
