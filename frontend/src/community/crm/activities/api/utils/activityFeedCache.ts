import { InfiniteData, QueryClient } from "@tanstack/react-query";

import { crmActivityQueryKeys } from "~community/crm/activities/api/utils/QueryKeys";
import {
  ActivityFeedResponse,
  ActivityRow,
  ActivityTaskDetail,
  ActivityType
} from "~community/crm/activities/types/activityTypes";

export type ActivityFeedCacheData = InfiniteData<ActivityFeedResponse, number>;

const isTaskRow = (row: ActivityRow, taskId: number): boolean =>
  row.type === ActivityType.TASK && row.id === taskId;

const patchRows = (
  rows: ActivityRow[],
  taskId: number,
  patch: Partial<ActivityRow>
): ActivityRow[] =>
  rows.map((row) => (isTaskRow(row, taskId) ? { ...row, ...patch } : row));

const patchPage = (
  page: ActivityFeedResponse,
  taskId: number,
  patch: Partial<ActivityRow>
): ActivityFeedResponse => ({
  ...page,
  overdue: patchRows(page.overdue ?? [], taskId, patch),
  today: patchRows(page.today ?? [], taskId, patch),
  upcoming: patchRows(page.upcoming ?? [], taskId, patch),
  byMonth: {
    ...page.byMonth,
    items: patchRows(page.byMonth?.items ?? [], taskId, patch)
  }
});

export const patchTaskInFeedData = (
  data: ActivityFeedCacheData | null,
  taskId: number,
  patch: Partial<ActivityRow>
): ActivityFeedCacheData | null =>
  data
    ? {
        ...data,
        pages: data.pages.map((page) => patchPage(page, taskId, patch))
      }
    : data;

export const patchTaskInFeedCache = (
  queryClient: QueryClient,
  taskId: number,
  patch: Partial<ActivityRow>
): void => {
  queryClient
    .getQueriesData<ActivityFeedCacheData>({
      queryKey: crmActivityQueryKeys.FEED_ROOT
    })
    .forEach(([queryKey, data]) => {
      if (!data) return;

      queryClient.setQueryData<ActivityFeedCacheData>(
        queryKey,
        patchTaskInFeedData(data, taskId, patch) ?? data
      );
    });
};

export const markFeedCacheStale = (queryClient: QueryClient): Promise<void> =>
  queryClient.invalidateQueries({
    queryKey: crmActivityQueryKeys.FEED_ROOT,
    refetchType: "none"
  });

export const toFeedRowPatch = (
  detail: ActivityTaskDetail
): Partial<ActivityRow> => ({
  subject: detail.name,
  priority: detail.priority,
  dueAt: detail.dueAt,
  isCompleted: detail.isCompleted,
  completedAt: detail.completedAt,
  canComplete: detail.canComplete
});
