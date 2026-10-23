import { useCallback, useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useCommonStore } from "~community/common/stores/commonStore";
import {
  useGetActivityFeedInfinite,
  useGetActivityList,
  useGetActivityTeamMembers
} from "~community/crm/activities/api/ActivityApi";
import {
  ActivityFeedQuery,
  countActivityFeedRows,
  getActivityTypeForTab,
  resolveViewerTimezone,
  shouldShowActivityControls
} from "~community/crm/activities/api/utils/activityFeedParams";
import { toActivityListPage } from "~community/crm/activities/api/utils/activityListUtil";
import { useActivityStore } from "~community/crm/activities/store/activityStore";
import {
  ActivityFeedResponse,
  ActivityFilterValues,
  ActivityRow,
  ActivityTab,
  ActivityTeamMember
} from "~community/crm/activities/types/activityTypes";
import { useCrmStore } from "~community/crm/store/store";

export interface UseActivityFeedResult {
  isManager: boolean;
  timeZone: string;
  activeTab: ActivityTab;
  search: string;
  appliedFilters: ActivityFilterValues;
  showControls: boolean;
  setActiveTab: (tab: ActivityTab) => void;
  setSearch: (search: string) => void;
  applyFilters: (filters: ActivityFilterValues) => void;
  pages: ActivityFeedResponse[];
  resultCount: number | null;
  isLoading: boolean;
  isError: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  loadMore: () => void;
  teamMembers: ActivityTeamMember[];
  isTeamMembersError: boolean;
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
    setActiveTab,
    setSearch,
    applyFilters
  } = useActivityStore(
    useShallow((store) => ({
      activeTab: store.activeTab,
      search: store.search,
      appliedFilters: store.appliedFilters,
      setActiveTab: store.setActiveTab,
      setSearch: store.setSearch,
      applyFilters: store.applyFilters
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

  const isAllTab = activeTab === ActivityTab.ALL;

  const feed = useGetActivityFeedInfinite(query, isAllTab);
  const list = useGetActivityList(query, !isAllTab);

  const { owners, contacts } = useCrmStore(
    useShallow((store) => ({
      owners: store.owners,
      contacts: store.contacts
    }))
  );

  const { data: teamMembers, isError: isTeamMembersError } =
    useGetActivityTeamMembers(isManager);

  const listData = list.data;

  const listPages = useMemo(() => {
    const type = getActivityTypeForTab(activeTab);

    if (!type || !listData) return NO_PAGES;

    return [toActivityListPage(type, listData, { owners, contacts })];
  }, [activeTab, listData, owners, contacts]);

  const pages = isAllTab ? (feed.data?.pages ?? NO_PAGES) : listPages;
  const isLoading = isAllTab ? feed.isLoading : list.isLoading;
  const isError = isAllTab ? feed.isError : list.isError;
  const errorUpdatedAt = isAllTab ? feed.errorUpdatedAt : list.errorUpdatedAt;
  const hasNextPage = isAllTab ? feed.hasNextPage : false;
  const isFetchingNextPage = isAllTab ? feed.isFetchingNextPage : false;
  const { fetchNextPage } = feed;

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

  const resultCount =
    isLoading || isError ? null : countActivityFeedRows(pages);

  const showControls = shouldShowActivityControls({
    hasActiveFilters:
      query.ownerId !== null ||
      query.from !== null ||
      query.to !== null ||
      query.search.length > 0,
    isError,
    isLoading,
    isEmpty: resultCount === 0
  });

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    isManager,
    timeZone,
    activeTab,
    search,
    appliedFilters,
    showControls,
    setActiveTab,
    setSearch,
    applyFilters,
    pages,
    resultCount,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    loadMore,
    teamMembers: teamMembers ?? NO_TEAM_MEMBERS,
    isTeamMembersError
  };
};
