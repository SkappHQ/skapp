import { useCallback, useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useCommonStore } from "~community/common/stores/commonStore";
import {
  useGetActivityFeedInfinite,
  useGetActivityTeamMembers
} from "~community/crm/activities/api/ActivityApi";
import {
  ActivityFeedQuery,
  countActivityFeedRows,
  isActivityFeedEmpty,
  resolveViewerTimezone,
  shouldShowActivityControls
} from "~community/crm/activities/api/utils/activityFeedParams";
import { useActivityTaskCompletion } from "~community/crm/activities/hooks/useActivityTaskCompletion";
import { useActivityStore } from "~community/crm/activities/store/activityStore";
import { SelectedActivity } from "~community/crm/activities/store/activityStoreTypes";
import {
  ActivityFeedResponse,
  ActivityFilterValues,
  ActivityRow,
  ActivityTab,
  ActivityTeamMember
} from "~community/crm/activities/types/activityTypes";

export interface UseActivityFeedResult {
  isManager: boolean;
  timeZone: string;
  activeTab: ActivityTab;
  search: string;
  appliedFilters: ActivityFilterValues;
  hasAppliedFilters: boolean;
  hasActiveFilters: boolean;
  showControls: boolean;
  selectedActivity: SelectedActivity | null;
  setActiveTab: (tab: ActivityTab) => void;
  setSearch: (search: string) => void;
  applyFilters: (filters: ActivityFilterValues) => void;
  resetFilters: () => void;
  pages: ActivityFeedResponse[];
  resultCount: number | null;
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  loadMore: () => void;
  teamMembers: ActivityTeamMember[];
  isTeamMembersLoading: boolean;
  isTeamMembersError: boolean;
  onRowClick: (row: ActivityRow) => void;
  onToggleComplete: (row: ActivityRow, isCompleted: boolean) => void;
}

const NO_PAGES: ActivityFeedResponse[] = [];
const NO_TEAM_MEMBERS: ActivityTeamMember[] = [];

export const useActivityFeed = (): UseActivityFeedResult => {
  const translateText = useTranslator("crmModule");
  const { setToastMessage } = useToast();
  const { isCrmSalesManager, isCrmAdmin, isSuperAdmin } = useSessionData();
  const requestTimezone = useCommonStore((state) => state.requestTimezone);

  const isManager = Boolean(isCrmSalesManager || isCrmAdmin || isSuperAdmin);
  const timeZone = resolveViewerTimezone(requestTimezone);

  const {
    activeTab,
    search,
    appliedFilters,
    selectedActivity,
    setActiveTab,
    setSearch,
    applyFilters,
    resetFilters,
    setSelectedActivity
  } = useActivityStore(
    useShallow((store) => ({
      activeTab: store.activeTab,
      search: store.search,
      appliedFilters: store.appliedFilters,
      selectedActivity: store.selectedActivity,
      setActiveTab: store.setActiveTab,
      setSearch: store.setSearch,
      applyFilters: store.applyFilters,
      resetFilters: store.resetFilters,
      setSelectedActivity: store.setSelectedActivity
    }))
  );

  const query: ActivityFeedQuery = useMemo(
    () => ({
      tab: activeTab,
      search: search.trim(),
      ownerId: isManager ? appliedFilters.ownerId : null,
      from: isManager ? appliedFilters.dateRange.from : null,
      to: isManager ? appliedFilters.dateRange.to : null
    }),
    [activeTab, search, isManager, appliedFilters]
  );

  const {
    data,
    isLoading,
    isError,
    errorUpdatedAt,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  } = useGetActivityFeedInfinite(query);

  const {
    data: teamMembers,
    isLoading: isTeamMembersLoading,
    isError: isTeamMembersError
  } = useGetActivityTeamMembers(isManager);

  useEffect(() => {
    if (!isError) return;

    setToastMessage({
      open: true,
      toastType: ToastType.WARN,
      title: translateText(["activities", "toasts", "loadError", "title"]),
      description: translateText([
        "activities",
        "toasts",
        "loadError",
        "description"
      ]),
      isIcon: true
    });
  }, [isError, errorUpdatedAt]);

  const pages = data?.pages ?? NO_PAGES;

  const isEmpty = !isLoading && !isError && isActivityFeedEmpty(pages);

  const resultCount =
    isLoading || isError ? null : countActivityFeedRows(pages);

  const hasAppliedFilters =
    query.ownerId !== null || query.from !== null || query.to !== null;

  const hasActiveFilters = hasAppliedFilters || query.search.length > 0;

  const showControls = shouldShowActivityControls({
    hasActiveFilters,
    isError,
    isLoading,
    isEmpty
  });

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const onRowClick = useCallback(
    (row: ActivityRow) => {
      setSelectedActivity({ id: row.id, type: row.type });
    },
    [setSelectedActivity]
  );

  const { toggleTaskComplete: onToggleComplete } = useActivityTaskCompletion();

  return {
    isManager,
    timeZone,
    activeTab,
    search,
    appliedFilters,
    hasAppliedFilters,
    hasActiveFilters,
    showControls,
    selectedActivity,
    setActiveTab,
    setSearch,
    applyFilters,
    resetFilters,
    pages,
    resultCount,
    isLoading,
    isError,
    isEmpty,
    hasNextPage,
    isFetchingNextPage,
    loadMore,
    teamMembers: teamMembers ?? NO_TEAM_MEMBERS,
    isTeamMembersLoading,
    isTeamMembersError,
    onRowClick,
    onToggleComplete
  };
};
