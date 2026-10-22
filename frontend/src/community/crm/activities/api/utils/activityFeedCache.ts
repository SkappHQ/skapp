import { InfiniteData, QueryClient } from "@tanstack/react-query";

import { instantInZone } from "~community/common/utils/dateTimeUtils";
import { crmActivityQueryKeys } from "~community/crm/activities/api/utils/QueryKeys";
import { getViewerTimezone } from "~community/crm/activities/api/utils/activityFeedParams";
import { ACTIVITY_MONTH_KEY_FORMAT } from "~community/crm/activities/constants/activityConstants";
import {
  ActivityFeedResponse,
  ActivityRow,
  ActivityTaskDetail,
  ActivityType
} from "~community/crm/activities/types/activityTypes";
import { getMonthAnchor } from "~community/crm/activities/utils/activityFeedUtil";

export type ActivityFeedCacheData = InfiniteData<ActivityFeedResponse, number>;

export type ActivityRowPatch =
  Partial<ActivityRow> | ((row: ActivityRow) => Partial<ActivityRow>);

const resolvePatch = (
  patch: ActivityRowPatch,
  row: ActivityRow
): Partial<ActivityRow> => (typeof patch === "function" ? patch(row) : patch);

const isTaskRow = (row: ActivityRow, taskId: number): boolean =>
  row.type === ActivityType.TASK && row.id === taskId;

const patchRows = (
  rows: ActivityRow[],
  taskId: number,
  patch: ActivityRowPatch
): ActivityRow[] =>
  rows.map((row) =>
    isTaskRow(row, taskId) ? { ...row, ...resolvePatch(patch, row) } : row
  );

const patchPage = (
  page: ActivityFeedResponse,
  taskId: number,
  patch: ActivityRowPatch
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
  patch: ActivityRowPatch
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
  patch: ActivityRowPatch
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

const getRowMonthKey = (row: ActivityRow, zone: string): string | null => {
  const anchor = getMonthAnchor(row);

  return anchor
    ? instantInZone(anchor, zone).toFormat(ACTIVITY_MONTH_KEY_FORMAT)
    : null;
};

const DATE_FIELDS: (keyof ActivityRow)[] = [
  "completedAt",
  "occurredAt",
  "dueAt"
];

export const keepMonthStable =
  (server: Partial<ActivityRow>) =>
  (row: ActivityRow): Partial<ActivityRow> => {
    const zone = getViewerTimezone();
    const isSameMonth =
      getRowMonthKey(row, zone) === getRowMonthKey({ ...row, ...server }, zone);

    if (isSameMonth) return server;

    const kept: Record<string, unknown> = { ...server };
    DATE_FIELDS.forEach((field) => delete kept[field]);

    return kept as Partial<ActivityRow>;
  };
