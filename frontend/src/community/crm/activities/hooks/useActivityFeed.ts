import { useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useCommonStore } from "~community/common/stores/commonStore";
import { useGetActivityFeed } from "~community/crm/activities/api/ActivityApi";
import {
  ActivityFeedQuery,
  resolveViewerTimezone,
  shouldShowActivityControls
} from "~community/crm/activities/api/utils/activityFeedParams";
import { useActivityStore } from "~community/crm/activities/store/activityStore";
import {
  ActivityFeedResponse,
  ActivityFilterValues,
  ActivityRow,
  ActivityTab,
  ActivityTeamMember
} from "~community/crm/activities/types/activityTypes";
import { toActivityTeamMembers } from "~community/crm/activities/utils/activityFilterUtil";
import { useGetOwnerLookup } from "~community/crm/api/ContactApi";
import { DEFAULT_LOOKUP_PAGE_SIZE } from "~community/crm/constants/commonConstants";

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
  rows: ActivityFeedResponse;
  resultCount: number | null;
  isLoading: boolean;
  isError: boolean;
  teamMembers: ActivityTeamMember[];
  isTeamMembersError: boolean;
}

const NO_ROWS: ActivityFeedResponse = [];

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

  const { data, isLoading, isError, errorUpdatedAt } =
    useGetActivityFeed(query);

  const { data: ownerLookup, isError: isTeamMembersError } = useGetOwnerLookup(
    "",
    DEFAULT_LOOKUP_PAGE_SIZE,
    isManager
  );
  const teamMembers = useMemo(
    () => toActivityTeamMembers(ownerLookup?.items ?? []),
    [ownerLookup]
  );

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

  const rows = data ?? NO_ROWS;

  const resultCount = isLoading || isError ? null : rows.length;

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
    rows,
    resultCount,
    isLoading,
    isError,
    teamMembers,
    isTeamMembersError
  };
};
