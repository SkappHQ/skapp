import {
  ActivityCallListItem,
  ActivityEmailListItem,
  ActivityFeedResponse,
  ActivityListItem,
  ActivityMeetingListItem,
  ActivityRow,
  ActivityTaskListItem,
  ActivityType
} from "~community/crm/activities/types/activityTypes";

const toRowBase = (item: ActivityListItem, contactIds: number[]) => ({
  id: item.id,
  ownerId: item.ownerId,
  dealId: item.dealId,
  companyId: item.companyId,
  contactIds,
  canComplete: false
});

const toCallRow = (item: ActivityCallListItem): ActivityRow => ({
  ...toRowBase(item, item.contactId === null ? [] : [item.contactId]),
  type: ActivityType.CALL,
  title: item.subject ?? "",
  dueAt: null,
  loggedAt: item.loggedAt,
  startAt: null,
  completedAt: null,
  isCompleted: false,
  priority: null
});

const toMeetingRow = (item: ActivityMeetingListItem): ActivityRow => ({
  ...toRowBase(item, item.contactIds),
  type: ActivityType.MEETING,
  title: item.name ?? "",
  dueAt: null,
  loggedAt: null,
  startAt: item.startAt,
  completedAt: null,
  isCompleted: false,
  priority: null
});

const toEmailRow = (item: ActivityEmailListItem): ActivityRow => ({
  ...toRowBase(item, item.contactIds),
  type: ActivityType.EMAIL,
  title: item.subject ?? "",
  dueAt: null,
  loggedAt: item.loggedAt,
  startAt: null,
  completedAt: null,
  isCompleted: false,
  priority: null
});

const toTaskRow = (item: ActivityTaskListItem): ActivityRow => ({
  ...toRowBase(item, item.contactId === null ? [] : [item.contactId]),
  type: ActivityType.TASK,
  title: item.name ?? "",
  dueAt: item.dueAt,
  loggedAt: null,
  startAt: null,
  completedAt: item.completedAt,
  isCompleted: item.isCompleted,
  priority: item.priority
});

const toRows = (
  type: ActivityType,
  items: ActivityListItem[]
): ActivityRow[] => {
  switch (type) {
    case ActivityType.CALL:
      return (items as ActivityCallListItem[]).map(toCallRow);
    case ActivityType.MEETING:
      return (items as ActivityMeetingListItem[]).map(toMeetingRow);
    case ActivityType.EMAIL:
      return (items as ActivityEmailListItem[]).map(toEmailRow);
    case ActivityType.TASK:
      return (items as ActivityTaskListItem[]).map(toTaskRow);
  }
};

export const toActivityListPage = (
  type: ActivityType,
  items: ActivityListItem[]
): ActivityFeedResponse => ({
  items: toRows(type, items),
  currentPage: 0,
  totalItems: items.length,
  totalPages: 1
});
