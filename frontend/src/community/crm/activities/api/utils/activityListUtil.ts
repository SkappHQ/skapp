import {
  ActivityCallListItem,
  ActivityEmailListItem,
  ActivityFeedResponse,
  ActivityListItem,
  ActivityMeetingListItem,
  ActivityOwner,
  ActivityRelatedAssociation,
  ActivityRow,
  ActivityTaskListItem,
  ActivityType
} from "~community/crm/activities/types/activityTypes";
import {
  CrmContactEntity,
  CrmContactRecord,
  CrmOwnerRecord
} from "~community/crm/types/CrmCommonTypes";

export interface ActivityListLookups {
  owners: CrmOwnerRecord;
  contacts: CrmContactRecord;
}

const toOwner = (
  ownerId: number | null,
  owners: CrmOwnerRecord
): ActivityOwner | null => {
  const owner = ownerId === null ? null : owners[ownerId];

  if (!owner) return null;

  return {
    id: owner.employeeId,
    name: [owner.firstName, owner.lastName].filter(Boolean).join(" "),
    avatar: owner.authPic
  };
};

const toLinkedContacts = (
  contactIds: number[],
  contacts: CrmContactRecord
): CrmContactEntity[] =>
  contactIds.flatMap((contactId) => {
    const contact = contacts[contactId];

    return contact?.name ? [contact] : [];
  });

const toContactLinks = (
  linkedContacts: CrmContactEntity[]
): ActivityRelatedAssociation[] =>
  linkedContacts.map((contact) => ({
    id: contact.id ?? 0,
    name: contact.name ?? "",
    deleted: false
  }));

const toCompanyLink = (
  companyId: number | null,
  linkedContacts: CrmContactEntity[]
): ActivityRelatedAssociation | null => {
  if (companyId === null) return null;

  const contact = linkedContacts.find(
    (linkedContact) =>
      linkedContact.companyId === companyId && linkedContact.companyName
  );

  return contact?.companyName
    ? { id: companyId, name: contact.companyName, deleted: false }
    : null;
};

const toRowBase = (
  item: ActivityListItem,
  contactIds: number[],
  lookups: ActivityListLookups
) => {
  const linkedContacts = toLinkedContacts(contactIds, lookups.contacts);

  return {
    id: item.id,
    owner: toOwner(item.ownerId, lookups.owners),
    contacts: toContactLinks(linkedContacts),
    deal: null,
    company: toCompanyLink(item.companyId, linkedContacts),
    canComplete: false
  };
};

const toCallRow = (
  item: ActivityCallListItem,
  lookups: ActivityListLookups
): ActivityRow => ({
  ...toRowBase(item, item.contactId === null ? [] : [item.contactId], lookups),
  type: ActivityType.CALL,
  subject: item.subject ?? "",
  dueAt: null,
  occurredAt: item.loggedAt,
  completedAt: null,
  isCompleted: false,
  priority: null
});

const toMeetingRow = (
  item: ActivityMeetingListItem,
  lookups: ActivityListLookups
): ActivityRow => ({
  ...toRowBase(item, item.contactIds, lookups),
  type: ActivityType.MEETING,
  subject: item.name ?? "",
  dueAt: item.isScheduled ? item.startAt : null,
  occurredAt: item.startAt,
  completedAt: null,
  isCompleted: false,
  priority: null
});

const toEmailRow = (
  item: ActivityEmailListItem,
  lookups: ActivityListLookups
): ActivityRow => ({
  ...toRowBase(item, item.contactIds, lookups),
  type: ActivityType.EMAIL,
  subject: item.subject ?? "",
  dueAt: null,
  occurredAt: item.loggedAt,
  completedAt: null,
  isCompleted: false,
  priority: null
});

const toTaskRow = (
  item: ActivityTaskListItem,
  lookups: ActivityListLookups
): ActivityRow => ({
  ...toRowBase(item, item.contactId === null ? [] : [item.contactId], lookups),
  type: ActivityType.TASK,
  subject: item.name ?? "",
  dueAt: item.dueAt,
  occurredAt: null,
  completedAt: item.completedAt,
  isCompleted: item.isCompleted,
  priority: item.priority
});

const toRows = (
  type: ActivityType,
  items: ActivityListItem[],
  lookups: ActivityListLookups
): ActivityRow[] => {
  switch (type) {
    case ActivityType.CALL:
      return (items as ActivityCallListItem[]).map((item) =>
        toCallRow(item, lookups)
      );
    case ActivityType.MEETING:
      return (items as ActivityMeetingListItem[]).map((item) =>
        toMeetingRow(item, lookups)
      );
    case ActivityType.EMAIL:
      return (items as ActivityEmailListItem[]).map((item) =>
        toEmailRow(item, lookups)
      );
    case ActivityType.TASK:
      return (items as ActivityTaskListItem[]).map((item) =>
        toTaskRow(item, lookups)
      );
  }
};

export const toActivityListPage = (
  type: ActivityType,
  items: ActivityListItem[],
  lookups: ActivityListLookups
): ActivityFeedResponse => ({
  overdue: [],
  today: [],
  upcoming: [],
  byMonth: { items: toRows(type, items, lookups), page: 0, hasMore: false }
});
