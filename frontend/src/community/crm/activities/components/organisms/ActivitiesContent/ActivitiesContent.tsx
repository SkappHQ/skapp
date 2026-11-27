import { ButtonV2, ButtonV2Props } from "@rootcodelabs/skapp-ui";
import { FC, MouseEvent, useEffect, useMemo, useRef, useState } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useDisplayZone } from "~community/common/hooks/useDisplayZone";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import ActivityFeed from "~community/crm/activities/components/organisms/ActivityFeed/ActivityFeed";
import ActivitySidePanels from "~community/crm/activities/components/organisms/ActivitySidePanels/ActivitySidePanels";
import ActivityToolbar from "~community/crm/activities/components/organisms/ActivityToolbar/ActivityToolbar";
import { DEFAULT_ACTIVITY_TAB } from "~community/crm/activities/constants/activityConstants";
import {
  ActivityFeedFilters,
  ActivityFeedResponse,
  ActivityFilterValues,
  ActivityListFilters,
  ActivityTab
} from "~community/crm/activities/types/activityTypes";
import {
  toCallRow,
  toEmailRow,
  toFeedPages,
  toMeetingRow,
  toTaskRow
} from "~community/crm/activities/utils/activityFeedUtil";
import {
  useGetActivityCalls,
  useGetActivityEmails,
  useGetActivityFeed,
  useGetActivityMeetings,
  useGetActivityTasks
} from "~community/crm/api/ActivityApi";
import AddActivityTaskModalContent from "~community/crm/components/molecules/AddActivityTaskModalContent/AddActivityTaskModalContent";
import LogCallModalContent from "~community/crm/components/molecules/LogCallModalContent/LogCallModalContent";
import LogEmailModalContent from "~community/crm/components/molecules/LogEmailModalContent/LogEmailModalContent";
import LogMeetingModalContent from "~community/crm/components/molecules/LogMeetingModalContent/LogMeetingModalContent";
import { useActivityTaskCompletion } from "~community/crm/hooks/useActivityTaskCompletion";
import { useInitializeCrmData } from "~community/crm/hooks/useInitializeCrmData";
import { useOpenActivitySidePanel } from "~community/crm/hooks/useOpenActivitySidePanel";
import { useCrmStore } from "~community/crm/store/store";
import useCrmLimitGuard from "~enterprise/crm/hooks/useCrmLimitGuard";
import useScheduleMeeting from "~enterprise/crm/hooks/useScheduleMeeting";
import { CrmLimitResource } from "~enterprise/crm/types/CrmLimitTypes";

const ActivitiesContent: FC = () => {
  const translateText = useTranslator("crmModule");
  const displayZone = useDisplayZone();
  const { setToastMessage } = useToast();
  const { isCrmSalesManager } = useSessionData();
  const isManager = Boolean(isCrmSalesManager);

  const { isCrmInitialDataError } = useInitializeCrmData();

  const [activeTab, setActiveTab] = useState<ActivityTab>(DEFAULT_ACTIVITY_TAB);

  useEffect(() => {
    const params = new URLSearchParams(globalThis.location.search);
    if (params.has("success") || params.has("error")) {
      setActiveTab(ActivityTab.MEETINGS);
    }
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<ActivityFilterValues>({});
  const { taskCompletions, setTaskCompletions, handleToggleComplete } =
    useActivityTaskCompletion();
  const [isLogCallModalOpen, setIsLogCallModalOpen] = useState(false);
  const [isLogMeetingModalOpen, setIsLogMeetingModalOpen] = useState(false);
  const { guardCrmCreate } = useCrmLimitGuard();
  const { scheduleMeetingButton, scheduleMeetingModals } = useScheduleMeeting();
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isLogEmailModalOpen, setIsLogEmailModalOpen] = useState(false);

  const actionButtonRef = useRef<HTMLButtonElement | null>(null);

  const focusActionButton = (): void => {
    requestAnimationFrame(() => {
      actionButtonRef.current?.focus();
    });
  };

  const isAllTab = activeTab === ActivityTab.ALL;

  const owners = useCrmStore((store) => store.owners);

  const teamMembers = useMemo(() => Object.values(owners), [owners]);

  const feedFilters: ActivityFeedFilters = useMemo(
    () => ({
      ...(searchTerm ? { search: searchTerm } : {}),
      ...(filters.ownerId ? { ownerId: filters.ownerId } : {}),
      ...(filters.fromDate ? { fromDate: filters.fromDate } : {}),
      ...(filters.toDate ? { toDate: filters.toDate } : {})
    }),
    [searchTerm, filters]
  );

  const listFilters: ActivityListFilters = useMemo(
    () => ({
      ...(searchTerm ? { searchKeyword: searchTerm } : {}),
      ...(filters.ownerId ? { ownerId: filters.ownerId } : {}),
      ...(filters.fromDate ? { startDate: filters.fromDate } : {}),
      ...(filters.toDate ? { endDate: filters.toDate } : {}),
      ...(filters.taskStatus ? { taskStatus: filters.taskStatus } : {}),
      ...(filters.priority ? { priority: filters.priority } : {})
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

  const {
    isLoading,
    isError,
    errorUpdatedAt,
    hasNextPage,
    isFetchNextPageError,
    isFetchingNextPage,
    fetchNextPage
  } = {
    [ActivityTab.ALL]: feed,
    [ActivityTab.CALLS]: calls,
    [ActivityTab.EMAILS]: emails,
    [ActivityTab.MEETINGS]: meetings,
    [ActivityTab.TASKS]: tasks
  }[activeTab];

  const pages: ActivityFeedResponse[] = useMemo(() => {
    if (isAllTab && feed.data) return feed.data.pages;
    if (activeTab === ActivityTab.CALLS && calls.data)
      return toFeedPages(calls.data.pages, toCallRow);
    if (activeTab === ActivityTab.EMAILS && emails.data)
      return toFeedPages(emails.data.pages, toEmailRow);
    if (activeTab === ActivityTab.MEETINGS && meetings.data)
      return toFeedPages(meetings.data.pages, toMeetingRow);
    if (activeTab === ActivityTab.TASKS && tasks.data)
      return toFeedPages(tasks.data.pages, toTaskRow);
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

  useEffect(() => {
    if (!isError) return;

    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["activities", "feed", "errorToast", "title"]),
      description: translateText([
        "activities",
        "feed",
        "errorToast",
        "description"
      ])
    });
  }, [isError, errorUpdatedAt]);

  const resultCount = pages.length > 0 ? pages[0].totalItems : rows.length;
  const hasActiveFilters =
    searchTerm.length > 0 || Object.keys(filters).length > 0;
  const showControls =
    hasActiveFilters || (!isLoading && (isError || rows.length > 0));

  const handleTabChange = (tab: ActivityTab): void => {
    setActiveTab(tab);

    if (tab === ActivityTab.TASKS) return;

    setFilters((previous) => {
      if (!isManager) return {};

      const next = { ...previous };
      delete next.taskStatus;
      delete next.priority;
      return next;
    });
  };

  const handleRowClick = useOpenActivitySidePanel();

  const handlePanelCompletionChange = (taskId: number): void => {
    setTaskCompletions((current) => {
      const next = { ...current };
      delete next[taskId];
      return next;
    });
  };

  const toolbarActions: Record<
    ActivityTab,
    { labelKey: string; onClick: () => void } | null
  > = {
    [ActivityTab.ALL]: null,
    [ActivityTab.TASKS]: {
      labelKey: "addTaskBtn",
      onClick: () =>
        guardCrmCreate(CrmLimitResource.ACTIVITIES, () =>
          setIsAddTaskModalOpen(true)
        )
    },
    [ActivityTab.CALLS]: {
      labelKey: "logCallBtn",
      onClick: () =>
        guardCrmCreate(CrmLimitResource.ACTIVITIES, () =>
          setIsLogCallModalOpen(true)
        )
    },
    [ActivityTab.MEETINGS]: {
      labelKey: "logMeetingBtn",
      onClick: () =>
        guardCrmCreate(CrmLimitResource.ACTIVITIES, () =>
          setIsLogMeetingModalOpen(true)
        )
    },
    [ActivityTab.EMAILS]: {
      labelKey: "logEmailBtn",
      onClick: () => setIsLogEmailModalOpen(true)
    }
  };

  const toolbarAction = toolbarActions[activeTab];

  const handleActionButtonClick = (
    event: MouseEvent<HTMLButtonElement>
  ): void => {
    actionButtonRef.current = event.currentTarget;
    toolbarAction?.onClick();
  };

  const actionButton: ButtonV2Props | null = toolbarAction
    ? {
        variant: "primary",
        type: "button",
        onClick: handleActionButtonClick,
        children: translateText([
          "activities",
          "toolbar",
          toolbarAction.labelKey
        ])
      }
    : null;

  const handleLogCallModalClose = (): void => {
    setIsLogCallModalOpen(false);
    focusActionButton();
  };

  const handleLogMeetingModalClose = (): void => {
    setIsLogMeetingModalOpen(false);
    focusActionButton();
  };

  const handleAddTaskModalClose = (): void => {
    setIsAddTaskModalOpen(false);
    focusActionButton();
  };

  const handleLogEmailModalClose = (): void => {
    setIsLogEmailModalOpen(false);
    focusActionButton();
  };

  const meetingsScheduleButton: ButtonV2Props | null =
    activeTab === ActivityTab.MEETINGS ? scheduleMeetingButton : null;

  return (
    <div className="flex flex-col w-full gap-4 pt-5.5 lg:pt-1">
      <ActivityToolbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        resultCount={resultCount}
        isResultCountReady={!isLoading && (!isError || rows.length > 0)}
        isManager={isManager}
        filters={filters}
        onApplyFilters={setFilters}
        teamMembers={teamMembers}
        isTeamMembersError={isCrmInitialDataError}
        timeZone={displayZone}
        showControls={showControls}
        action={
          showControls &&
          actionButton && (
            <div className="flex items-center gap-2">
              {meetingsScheduleButton && (
                <ButtonV2 {...meetingsScheduleButton} />
              )}
              <ButtonV2 {...actionButton} />
            </div>
          )
        }
      />
      {isLogCallModalOpen && (
        <LogCallModalContent
          title={translateText(["activities", "logCall", "modal", "title"])}
          onClose={handleLogCallModalClose}
        />
      )}
      {isLogMeetingModalOpen && (
        <LogMeetingModalContent
          title={translateText(["activities", "logMeeting", "modal", "title"])}
          onClose={handleLogMeetingModalClose}
        />
      )}
      {isAddTaskModalOpen && (
        <AddActivityTaskModalContent
          title={translateText(["activities", "addTask", "modal", "title"])}
          onClose={handleAddTaskModalClose}
        />
      )}
      {isLogEmailModalOpen && (
        <LogEmailModalContent
          title={translateText(["activities", "logEmail", "modal", "title"])}
          onClose={handleLogEmailModalClose}
        />
      )}
      {scheduleMeetingModals}
      <ActivityFeed
        activeTab={activeTab}
        pages={pages}
        searchTerm={searchTerm}
        isLoading={isLoading}
        isError={isError}
        hasNextPage={hasNextPage && !isFetchNextPageError}
        isFetchingNextPage={isFetchingNextPage}
        timeZone={displayZone}
        taskCompletions={taskCompletions}
        emptyStateButton={showControls ? null : actionButton}
        emptyStateSecondaryButton={showControls ? null : meetingsScheduleButton}
        errorStateDescription={translateText([
          "activities",
          "feed",
          "errorState",
          "description"
        ])}
        onLoadMore={fetchNextPage}
        onRowClick={handleRowClick}
        onToggleComplete={handleToggleComplete}
      />
      <ActivitySidePanels
        onTaskCompletionChange={handlePanelCompletionChange}
      />
    </div>
  );
};

export default ActivitiesContent;
