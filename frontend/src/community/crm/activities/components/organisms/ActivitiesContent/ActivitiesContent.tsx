import { FC, useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useDisplayZone } from "~community/common/hooks/useDisplayZone";
import useSessionData from "~community/common/hooks/useSessionData";
import ActivityFeed from "~community/crm/activities/components/organisms/ActivityFeed/ActivityFeed";
import ActivityToolbar from "~community/crm/activities/components/organisms/ActivityToolbar/ActivityToolbar";
import { DEFAULT_ACTIVITY_TAB } from "~community/crm/activities/constants/activityConstants";
import {
  ActivityCallResponse,
  ActivityEmailResponse,
  ActivityFeedFilters,
  ActivityFeedResponse,
  ActivityFilterValues,
  ActivityListFilters,
  ActivityListItemBase,
  ActivityMeetingResponse,
  ActivityRow,
  ActivityTab,
  ActivityTaskResponse,
  ActivityType
} from "~community/crm/activities/types/activityTypes";
import {
  useGetActivityCalls,
  useGetActivityEmails,
  useGetActivityFeed,
  useGetActivityMeetings,
  useGetActivityTasks
} from "~community/crm/api/ActivityApi";
import { useGetOwnerLookup } from "~community/crm/api/ContactApi";
import { useGetDealsByIds } from "~community/crm/api/DealApi";
import { DEFAULT_LOOKUP_PAGE_SIZE } from "~community/crm/constants/commonConstants";
import { useCrmStore } from "~community/crm/store/store";
import { CrmOwnerEntity } from "~community/crm/types/CrmCommonTypes";
import { getMissingDealIds, mergeDeals } from "~community/crm/utils/dealUtil";

const NO_PAGES: ActivityFeedResponse[] = [];
const NO_TEAM_MEMBERS: CrmOwnerEntity[] = [];

const toRowBase = (item: ActivityListItemBase) => ({
  id: item.id,
  ownerId: item.ownerId,
  dealId: item.dealId,
  companyId: item.companyId,
  dueAt: null,
  loggedAt: null,
  startAt: null,
  completedAt: null,
  isCompleted: false,
  priority: null,
  canComplete: false
});

const toCallRow = (item: ActivityCallResponse): ActivityRow => ({
  ...toRowBase(item),
  type: ActivityType.CALL,
  title: item.subject,
  loggedAt: item.loggedAt,
  contactIds: item.contactId ? [item.contactId] : []
});

const toEmailRow = (item: ActivityEmailResponse): ActivityRow => ({
  ...toRowBase(item),
  type: ActivityType.EMAIL,
  title: item.subject,
  loggedAt: item.loggedAt,
  contactIds: item.contactIds
});

const toMeetingRow = (item: ActivityMeetingResponse): ActivityRow => ({
  ...toRowBase(item),
  type: ActivityType.MEETING,
  title: item.name,
  startAt: item.startAt,
  contactIds: item.contactIds
});

const toTaskRow = (item: ActivityTaskResponse): ActivityRow => ({
  ...toRowBase(item),
  type: ActivityType.TASK,
  title: item.name,
  dueAt: item.dueAt,
  completedAt: item.completedAt,
  isCompleted: item.isCompleted,
  priority: item.priority,
  contactIds: item.contactId ? [item.contactId] : []
});

const toSinglePage = (items: ActivityRow[]): ActivityFeedResponse[] => [
  { items, currentPage: 0, totalItems: items.length, totalPages: 1 }
];

const ActivitiesContent: FC = () => {
  const displayZone = useDisplayZone();
  const { isCrmSalesManager, isCrmAdmin, isSuperAdmin } = useSessionData();
  const isManager = Boolean(isCrmSalesManager || isCrmAdmin || isSuperAdmin);

  const [activeTab, setActiveTab] = useState<ActivityTab>(DEFAULT_ACTIVITY_TAB);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<ActivityFilterValues>({});

  const { deals, setDeals } = useCrmStore(
    useShallow((store) => ({ deals: store.deals, setDeals: store.setDeals }))
  );

  const feedFilters: ActivityFeedFilters = useMemo(
    () => ({ ...(searchTerm ? { search: searchTerm } : {}), ...filters }),
    [searchTerm, filters]
  );

  const listFilters: ActivityListFilters = useMemo(
    () => ({
      ...(searchTerm ? { searchKeyword: searchTerm } : {}),
      ...(filters.ownerId ? { ownerId: filters.ownerId } : {}),
      ...(filters.fromDate ? { startDate: filters.fromDate } : {}),
      ...(filters.toDate ? { endDate: filters.toDate } : {})
    }),
    [searchTerm, filters]
  );

  const feed = useGetActivityFeed(feedFilters, activeTab === ActivityTab.ALL);
  const calls = useGetActivityCalls(
    listFilters,
    activeTab === ActivityTab.CALLS
  );
  const emails = useGetActivityEmails(
    listFilters,
    activeTab === ActivityTab.EMAILS
  );
  const meetings = useGetActivityMeetings(
    listFilters,
    activeTab === ActivityTab.MEETINGS
  );
  const tasks = useGetActivityTasks(
    listFilters,
    activeTab === ActivityTab.TASKS
  );

  const { data: ownerLookup, isError: isTeamMembersError } = useGetOwnerLookup(
    "",
    DEFAULT_LOOKUP_PAGE_SIZE,
    isManager
  );

  const { isLoading, isError } = {
    [ActivityTab.ALL]: feed,
    [ActivityTab.CALLS]: calls,
    [ActivityTab.EMAILS]: emails,
    [ActivityTab.MEETINGS]: meetings,
    [ActivityTab.TASKS]: tasks
  }[activeTab];

  const pages = useMemo(() => {
    if (activeTab === ActivityTab.ALL && feed.data) return feed.data.pages;
    if (activeTab === ActivityTab.CALLS && calls.data)
      return toSinglePage(calls.data.map(toCallRow));
    if (activeTab === ActivityTab.EMAILS && emails.data)
      return toSinglePage(emails.data.map(toEmailRow));
    if (activeTab === ActivityTab.MEETINGS && meetings.data)
      return toSinglePage(meetings.data.map(toMeetingRow));
    if (activeTab === ActivityTab.TASKS && tasks.data)
      return toSinglePage(tasks.data.map(toTaskRow));
    return NO_PAGES;
  }, [
    activeTab,
    feed.data,
    calls.data,
    emails.data,
    meetings.data,
    tasks.data
  ]);

  const rows = useMemo(() => pages.flatMap((page) => page.items), [pages]);

  const missingDealIds = useMemo(
    () =>
      getMissingDealIds(
        rows.flatMap((row) => (row.dealId ? [row.dealId] : [])),
        deals
      ),
    [rows, deals]
  );

  const { data: fetchedDeals } = useGetDealsByIds(
    missingDealIds,
    missingDealIds.length > 0
  );

  useEffect(() => {
    if (!fetchedDeals?.length) return;

    setDeals(mergeDeals(deals, fetchedDeals));
  }, [fetchedDeals]);

  const resultCount = isLoading || isError ? null : rows.length;
  const hasActiveFilters =
    searchTerm.length > 0 || Object.keys(filters).length > 0;

  const handleRowClick = (): void => {};

  const handleToggleComplete = (): void => {};

  return (
    <div className="flex flex-col w-full gap-4">
      <ActivityToolbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        resultCount={resultCount}
        isManager={isManager}
        filters={filters}
        onApplyFilters={setFilters}
        teamMembers={ownerLookup ? ownerLookup.items : NO_TEAM_MEMBERS}
        isTeamMembersError={isTeamMembersError}
        timeZone={displayZone}
        showControls={
          isLoading || isError || hasActiveFilters || rows.length > 0
        }
      />
      <ActivityFeed
        activeTab={activeTab}
        pages={pages}
        searchTerm={searchTerm}
        isLoading={isLoading}
        isError={isError}
        hasNextPage={feed.hasNextPage}
        isFetchingNextPage={feed.isFetchingNextPage}
        timeZone={displayZone}
        onLoadMore={feed.fetchNextPage}
        onRowClick={handleRowClick}
        onToggleComplete={handleToggleComplete}
      />
    </div>
  );
};

export default ActivitiesContent;
