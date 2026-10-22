import { useCallback, useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  useGetActivityFeedInfinite,
  useGetActivityTeamMembers
} from "~community/crm/activities/api/ActivityApi";
import {
  ActivityFeedQuery,
  isActivityFeedEmpty
} from "~community/crm/activities/api/utils/activityFeedParams";
import { useActivityStore } from "~community/crm/activities/store/activityStore";
import {
  ActivityAppliedFilters,
  SelectedActivity
} from "~community/crm/activities/store/activityStoreTypes";
import {
  ActivityFeedResponse,
  ActivityRow,
  ActivityTab,
  ActivityTeamMember
} from "~community/crm/activities/types/activityTypes";
import { SEARCH_DEBOUNCE_DELAY } from "~community/crm/constants/commonConstants";

interface UseActivityFeedParams {
  isManager: boolean;
}

export interface UseActivityFeedResult {
  activeTab: ActivityTab;
  search: string;
  appliedSearch: string;
  appliedFilters: ActivityAppliedFilters;
  hasAppliedFilters: boolean;
  hasActiveFilters: boolean;
  selectedActivity: SelectedActivity | null;
  setActiveTab: (tab: ActivityTab) => void;
  setSearch: (search: string) => void;
  applyFilters: (filters: ActivityAppliedFilters) => void;
  resetFilters: () => void;
  pages: ActivityFeedResponse[];
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
  onToggleComplete: (row: ActivityRow) => void;
}

const NO_PAGES: ActivityFeedResponse[] = [];
const NO_TEAM_MEMBERS: ActivityTeamMember[] = [];

export const useActivityFeed = ({
  isManager
}: UseActivityFeedParams): UseActivityFeedResult => {
  const translateText = useTranslator("crmModule");
  const { setToastMessage } = useToast();

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

  const appliedSearch = useDebounce(search.trim(), SEARCH_DEBOUNCE_DELAY);

  const query: ActivityFeedQuery = useMemo(
    () => ({
      tab: activeTab,
      search: appliedSearch,
      ownerId: isManager ? appliedFilters.ownerId : null,
      from: isManager ? appliedFilters.from : null,
      to: isManager ? appliedFilters.to : null
    }),
    [activeTab, appliedSearch, isManager, appliedFilters]
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

  const hasAppliedFilters =
    query.ownerId !== null || query.from !== null || query.to !== null;

  const hasActiveFilters = hasAppliedFilters || query.search.length > 0;

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

  const onToggleComplete = useCallback(() => {}, []);

  return {
    activeTab,
    search,
    appliedSearch,
    appliedFilters,
    hasAppliedFilters,
    hasActiveFilters,
    selectedActivity,
    setActiveTab,
    setSearch,
    applyFilters,
    resetFilters,
    pages,
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
