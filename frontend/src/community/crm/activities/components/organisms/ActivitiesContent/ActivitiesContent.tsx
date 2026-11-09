import { ButtonV2, ButtonV2Props } from "@rootcodelabs/skapp-ui";
import { FC, useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useDisplayZone } from "~community/common/hooks/useDisplayZone";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import ActivityCallSidePanel from "~community/crm/activities/components/organisms/ActivityCallSidePanel/ActivityCallSidePanel";
import ActivityEmailSidePanel from "~community/crm/activities/components/organisms/ActivityEmailSidePanel/ActivityEmailSidePanel";
import ActivityFeed from "~community/crm/activities/components/organisms/ActivityFeed/ActivityFeed";
import ActivityMeetingSidePanel from "~community/crm/activities/components/organisms/ActivityMeetingSidePanel/ActivityMeetingSidePanel";
import ActivityTaskSidePanel from "~community/crm/activities/components/organisms/ActivityTaskSidePanel/ActivityTaskSidePanel";
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
  useGetActivityTasks,
  useUpdateTaskCompletion
} from "~community/crm/api/ActivityApi";
import { useGetDealsByIds } from "~community/crm/api/DealApi";
import AddActivityTaskModalContent from "~community/crm/components/molecules/AddActivityTaskModalContent/AddActivityTaskModalContent";
import LogCallModalContent from "~community/crm/components/molecules/LogCallModalContent/LogCallModalContent";
import LogEmailModalContent from "~community/crm/components/molecules/LogEmailModalContent/LogEmailModalContent";
import LogMeetingModalContent from "~community/crm/components/molecules/LogMeetingModalContent/LogMeetingModalContent";
import SidePanelWrapper from "~community/crm/components/templates/SidePanelWrapper/SidePanelWrapper";
import { useInitializeCrmData } from "~community/crm/hooks/useInitializeCrmData";
import { useCrmStore } from "~community/crm/store/store";
import { CrmTaskCompletionPayload } from "~community/crm/types/CrmCommonTypes";
import { CrmSidePanelTypes } from "~community/crm/types/CrmTypes";
import { getMissingDealIds, mergeDeals } from "~community/crm/utils/dealUtil";

const ActivitiesContent: FC = () => {
  const translateText = useTranslator("crmModule");
  const displayZone = useDisplayZone();
  const { setToastMessage } = useToast();
  const { isCrmSalesManager } = useSessionData();
  const isManager = Boolean(isCrmSalesManager);

  const { isCrmInitialDataError } = useInitializeCrmData();

  const [activeTab, setActiveTab] = useState<ActivityTab>(DEFAULT_ACTIVITY_TAB);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<ActivityFilterValues>({});
  const [taskCompletions, setTaskCompletions] = useState<
    Record<number, boolean>
  >({});
  const [isLogCallModalOpen, setIsLogCallModalOpen] = useState(false);
  const [isLogMeetingModalOpen, setIsLogMeetingModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isLogEmailModalOpen, setIsLogEmailModalOpen] = useState(false);

  const isAllTab = activeTab === ActivityTab.ALL;

  const {
    owners,
    deals,
    selectedCallId,
    selectedMeetingId,
    selectedActivityTaskId,
    selectedEmailId,
    isCrmSidePanelOpen,
    setDeals,
    setSelectedCallId,
    setSelectedMeetingId,
    setSelectedActivityTaskId,
    setSelectedEmailId,
    openCrmSidePanel
  } = useCrmStore(
    useShallow((store) => ({
      owners: store.owners,
      deals: store.deals,
      selectedCallId: store.selectedCallId,
      selectedMeetingId: store.selectedMeetingId,
      selectedActivityTaskId: store.selectedActivityTaskId,
      selectedEmailId: store.selectedEmailId,
      isCrmSidePanelOpen: store.isCrmSidePanelOpen,
      setDeals: store.setDeals,
      setSelectedCallId: store.setSelectedCallId,
      setSelectedMeetingId: store.setSelectedMeetingId,
      setSelectedActivityTaskId: store.setSelectedActivityTaskId,
      setSelectedEmailId: store.setSelectedEmailId,
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
  const showControls =
    isLoading || isError || hasActiveFilters || rows.length > 0;

  const handleRowClick = (row: ActivityRow): void => {
    switch (row.type) {
      case ActivityType.CALL:
        setSelectedCallId(row.id);
        openCrmSidePanel(CrmSidePanelTypes.CALL_SIDE_PANEL);
        break;
      case ActivityType.MEETING:
        setSelectedMeetingId(row.id);
        openCrmSidePanel(CrmSidePanelTypes.MEETING_SIDE_PANEL);
        break;
      case ActivityType.TASK:
        setSelectedActivityTaskId(row.id);
        openCrmSidePanel(CrmSidePanelTypes.ACTIVITY_TASK_SIDE_PANEL);
        break;
      case ActivityType.EMAIL:
        setSelectedEmailId(row.id);
        openCrmSidePanel(CrmSidePanelTypes.EMAIL_SIDE_PANEL);
        break;
      default:
        break;
    }
  };

  const applyCompletion = (taskId: number, isCompleted: boolean): void => {
    setTaskCompletions((current) => ({ ...current, [taskId]: isCompleted }));
  };

  const handleToggleError = ({
    id,
    isCompleted
  }: CrmTaskCompletionPayload): void => {
    applyCompletion(id, !isCompleted);
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText([
        "tasks",
        "common",
        "toastMessages",
        "toggleErrorTitle"
      ]),
      description: translateText([
        "tasks",
        "common",
        "toastMessages",
        "toggleErrorDescription"
      ])
    });
  };

  const { mutate: updateTaskCompletion, isPending } =
    useUpdateTaskCompletion(handleToggleError);

  const handleToggleComplete = (
    row: ActivityRow,
    isCompleted: boolean
  ): void => {
    if (isPending) return;

    applyCompletion(row.id, isCompleted);

    updateTaskCompletion({ id: row.id, isCompleted });
  };

  const toolbarActions: Record<
    ActivityTab,
    { labelKey: string; onClick: () => void } | null
  > = {
    [ActivityTab.ALL]: null,
    [ActivityTab.TASKS]: {
      labelKey: "addTaskBtn",
      onClick: () => setIsAddTaskModalOpen(true)
    },
    [ActivityTab.CALLS]: {
      labelKey: "logCallBtn",
      onClick: () => setIsLogCallModalOpen(true)
    },
    [ActivityTab.MEETINGS]: {
      labelKey: "logMeetingBtn",
      onClick: () => setIsLogMeetingModalOpen(true)
    },
    [ActivityTab.EMAILS]: {
      labelKey: "logEmailBtn",
      onClick: () => setIsLogEmailModalOpen(true)
    }
  };

  const toolbarAction = toolbarActions[activeTab];

  const actionButton: ButtonV2Props | null = toolbarAction
    ? {
        variant: "primary",
        type: "button",
        onClick: toolbarAction.onClick,
        children: translateText([
          "activities",
          "toolbar",
          toolbarAction.labelKey
        ])
      }
    : null;

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
        showControls={showControls}
        action={showControls && actionButton && <ButtonV2 {...actionButton} />}
      />
      {isLogCallModalOpen && (
        <LogCallModalContent onClose={() => setIsLogCallModalOpen(false)} />
      )}
      {isLogMeetingModalOpen && (
        <LogMeetingModalContent
          onClose={() => setIsLogMeetingModalOpen(false)}
        />
      )}
      {isAddTaskModalOpen && (
        <AddActivityTaskModalContent
          onClose={() => setIsAddTaskModalOpen(false)}
        />
      )}
      {isLogEmailModalOpen && (
        <LogEmailModalContent onClose={() => setIsLogEmailModalOpen(false)} />
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
        taskCompletions={taskCompletions}
        emptyStateButton={showControls ? null : actionButton}
        onLoadMore={feed.fetchNextPage}
        onRowClick={handleRowClick}
        onToggleComplete={handleToggleComplete}
      />
      {selectedCallId !== null && (
        <SidePanelWrapper isOpen={isCrmSidePanelOpen}>
          <ActivityCallSidePanel callId={selectedCallId} />
        </SidePanelWrapper>
      )}
      {selectedMeetingId !== null && (
        <SidePanelWrapper isOpen={isCrmSidePanelOpen}>
          <ActivityMeetingSidePanel meetingId={selectedMeetingId} />
        </SidePanelWrapper>
      )}
      {selectedActivityTaskId !== null && (
        <SidePanelWrapper isOpen={isCrmSidePanelOpen}>
          <ActivityTaskSidePanel taskId={selectedActivityTaskId} />
        </SidePanelWrapper>
      )}
      {selectedEmailId !== null && (
        <SidePanelWrapper isOpen={isCrmSidePanelOpen}>
          <ActivityEmailSidePanel emailId={selectedEmailId} />
        </SidePanelWrapper>
      )}
    </div>
  );
};

export default ActivitiesContent;
