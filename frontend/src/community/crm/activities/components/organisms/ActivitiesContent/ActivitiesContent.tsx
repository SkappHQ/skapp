import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC, useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useDisplayZone } from "~community/common/hooks/useDisplayZone";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import ActivityCallSidePanel from "~community/crm/activities/components/organisms/ActivityCallSidePanel/ActivityCallSidePanel";
import ActivityFeed from "~community/crm/activities/components/organisms/ActivityFeed/ActivityFeed";
import ActivityToolbar from "~community/crm/activities/components/organisms/ActivityToolbar/ActivityToolbar";
import { DEFAULT_ACTIVITY_TAB } from "~community/crm/activities/constants/activityConstants";
import {
  ActivityFeedFilters,
  ActivityFeedResponse,
  ActivityFilterValues,
  ActivityListFilters,
  ActivityRow,
  ActivityTab,
  ActivityType
} from "~community/crm/activities/types/activityTypes";
import {
  toCallRow,
  toEmailRow,
  toMeetingRow,
  toSingleFeedPage,
  toTaskRow
} from "~community/crm/activities/utils/activityFeedUtil";
import {
  useGetActivityCalls,
  useGetActivityEmails,
  useGetActivityFeed,
  useGetActivityMeetings,
  useGetActivityTasks
} from "~community/crm/api/ActivityApi";
import { useGetDealsByIds } from "~community/crm/api/DealApi";
import LogCallModalContent from "~community/crm/components/molecules/LogCallModalContent/LogCallModalContent";
import SidePanelWrapper from "~community/crm/components/templates/SidePanelWrapper/SidePanelWrapper";
import { useInitializeCrmData } from "~community/crm/hooks/useInitializeCrmData";
import { useCrmStore } from "~community/crm/store/store";
import { CrmSidePanelTypes } from "~community/crm/types/CrmTypes";
import { getMissingDealIds, mergeDeals } from "~community/crm/utils/dealUtil";

const ActivitiesContent: FC = () => {
  const translateText = useTranslator("crmModule");
  const displayZone = useDisplayZone();
  const { isCrmSalesManager } = useSessionData();
  const isManager = Boolean(isCrmSalesManager);

  const { isCrmInitialDataError } = useInitializeCrmData();

  const [activeTab, setActiveTab] = useState<ActivityTab>(DEFAULT_ACTIVITY_TAB);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<ActivityFilterValues>({});
  const [isLogCallModalOpen, setIsLogCallModalOpen] = useState(false);

  const isAllTab = activeTab === ActivityTab.ALL;

  const {
    owners,
    deals,
    selectedCallId,
    isCrmSidePanelOpen,
    setDeals,
    setSelectedCallId,
    openCrmSidePanel
  } = useCrmStore(
    useShallow((store) => ({
      owners: store.owners,
      deals: store.deals,
      selectedCallId: store.selectedCallId,
      isCrmSidePanelOpen: store.isCrmSidePanelOpen,
      setDeals: store.setDeals,
      setSelectedCallId: store.setSelectedCallId,
      openCrmSidePanel: store.openCrmSidePanel
    }))
  );

  const teamMembers = useMemo(() => Object.values(owners), [owners]);

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

  const feed = useGetActivityFeed(feedFilters, isAllTab);
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

  const { isLoading, isError } = {
    [ActivityTab.ALL]: feed,
    [ActivityTab.CALLS]: calls,
    [ActivityTab.EMAILS]: emails,
    [ActivityTab.MEETINGS]: meetings,
    [ActivityTab.TASKS]: tasks
  }[activeTab];

  const pages: ActivityFeedResponse[] = useMemo(() => {
    if (isAllTab && feed.data) return feed.data.pages;
    if (activeTab === ActivityTab.CALLS && calls.data)
      return toSingleFeedPage(calls.data.map(toCallRow));
    if (activeTab === ActivityTab.EMAILS && emails.data)
      return toSingleFeedPage(emails.data.map(toEmailRow));
    if (activeTab === ActivityTab.MEETINGS && meetings.data)
      return toSingleFeedPage(meetings.data.map(toMeetingRow));
    if (activeTab === ActivityTab.TASKS && tasks.data)
      return toSingleFeedPage(tasks.data.map(toTaskRow));
    return [];
  }, [
    activeTab,
    isAllTab,
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

  const resultCount =
    isAllTab && feed.data ? feed.data.pages[0].totalItems : rows.length;
  const hasActiveFilters =
    searchTerm.length > 0 || Object.keys(filters).length > 0;

  const handleRowClick = (row: ActivityRow): void => {
    if (row.type !== ActivityType.CALL) return;

    setSelectedCallId(row.id);
    openCrmSidePanel(CrmSidePanelTypes.CALL_SIDE_PANEL);
  };

  const handleToggleComplete = (): void => {};

  return (
    <div className="flex flex-col w-full gap-4 pt-5.5 lg:pt-1">
      <ActivityToolbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        resultCount={resultCount}
        isResultCountReady={!isLoading && !isError}
        isManager={isManager}
        filters={filters}
        onApplyFilters={setFilters}
        teamMembers={teamMembers}
        isTeamMembersError={isCrmInitialDataError}
        timeZone={displayZone}
        showControls={
          isLoading || isError || hasActiveFilters || rows.length > 0
        }
        action={
          activeTab === ActivityTab.CALLS && (
            <ButtonV2
              variant="primary"
              type="button"
              onClick={() => setIsLogCallModalOpen(true)}
            >
              {translateText(["activities", "toolbar", "logCallBtn"])}
            </ButtonV2>
          )
        }
      />
      {isLogCallModalOpen && (
        <LogCallModalContent onClose={() => setIsLogCallModalOpen(false)} />
      )}
      <ActivityFeed
        activeTab={activeTab}
        pages={pages}
        searchTerm={searchTerm}
        isLoading={isLoading}
        isError={isError}
        hasNextPage={isAllTab && feed.hasNextPage}
        isFetchingNextPage={isAllTab && feed.isFetchingNextPage}
        timeZone={displayZone}
        onLoadMore={feed.fetchNextPage}
        onRowClick={handleRowClick}
        onToggleComplete={handleToggleComplete}
      />
      {selectedCallId !== null && (
        <SidePanelWrapper isOpen={isCrmSidePanelOpen}>
          <ActivityCallSidePanel callId={selectedCallId} />
        </SidePanelWrapper>
      )}
    </div>
  );
};

export default ActivitiesContent;
