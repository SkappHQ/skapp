import {
  ActivityLink,
  ActivityOwner,
  ActivityTaskDetail
} from "~community/crm/activities/types/activityTypes";
import { CrmPriorityEnum } from "~community/crm/enums/common";

export interface ActivityTaskDetailResponse {
  id: number;
  name: string;
  priority?: CrmPriorityEnum | null;
  dueAt?: string | null;
  isCompleted?: boolean;
  completedAt?: string | null;
  lastModifiedDate?: string | null;
  notes?: string | null;
  owner?: ActivityOwner | null;
  contact?: ActivityLink | null;
  deal?: ActivityLink | null;
  company?: ActivityLink | null;
  canComplete?: boolean;
}

export const toActivityTaskDetail = (
  response: ActivityTaskDetailResponse
): ActivityTaskDetail => ({
  id: response.id,
  name: response.name ?? "",
  priority: response.priority ?? null,
  dueAt: response.dueAt ?? null,
  isCompleted: response.isCompleted ?? false,
  completedAt: response.completedAt ?? null,
  notes: response.notes ?? null,
  owner: response.owner ?? null,
  contact: response.contact ?? null,
  deal: response.deal ?? null,
  company: response.company ?? null,
  canComplete: response.canComplete ?? false
});
