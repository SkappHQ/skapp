import { Dropdown } from "@rootcodelabs/skapp-ui";
import { FC, ReactNode, useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useDisplayZone } from "~community/common/hooks/useDisplayZone";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import ActivitySearchField from "~community/crm/activities/components/molecules/ActivitySearchField/ActivitySearchField";
import ActivityFeed from "~community/crm/activities/components/organisms/ActivityFeed/ActivityFeed";
import {
  ActivityRecordType,
  ActivityRow,
  ActivityTab,
  ActivityType,
  RecordActivityFilters
} from "~community/crm/activities/types/activityTypes";
import {
  useGetRecordActivities,
  useUpdateTaskCompletion
} from "~community/crm/api/ActivityApi";
import { useGetDealsByIds } from "~community/crm/api/DealApi";
import { useCrmStore } from "~community/crm/store/store";
import { CrmTaskCompletionPayload } from "~community/crm/types/CrmCommonTypes";
import { getMissingDealIds, mergeDeals } from "~community/crm/utils/dealUtil";

export interface RecordActivitiesTabProps {
  id: string;
  recordType: ActivityRecordType;
  recordId: number;
  activeTab: ActivityTab;
  onTabChange: (tab: ActivityTab) => void;
  actions?: ReactNode;
}

const RecordActivitiesTab: FC<RecordActivitiesTabProps> = ({
  id,
  recordType,
  recordId,
  activeTab,
  onTabChange,
  actions
}) => {
  const translateText = useTranslator("crmModule");
  const translateAria = useTranslator("crmAria");
  const displayZone = useDisplayZone();
  const { setToastMessage } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [taskCompletions, setTaskCompletions] = useState<
    Record<number, boolean>
  >({});

  const { deals, setDeals } = useCrmStore(
    useShallow((store) => ({
      deals: store.deals,
      setDeals: store.setDeals
    }))
  );

  const activityType = {
    [ActivityTab.ALL]: null,
    [ActivityTab.TASKS]: ActivityType.TASK,
    [ActivityTab.EMAILS]: ActivityType.EMAIL,
    [ActivityTab.CALLS]: ActivityType.CALL,
    [ActivityTab.MEETINGS]: ActivityType.MEETING
  }[activeTab];

  const filters: RecordActivityFilters = useMemo(
    () => ({
      recordType,
      recordId,
      ...(activityType ? { type: activityType } : {}),
      ...(searchTerm ? { search: searchTerm } : {})
    }),
    [recordType, recordId, activityType, searchTerm]
  );

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  } = useGetRecordActivities(filters);

  const pages = useMemo(() => (data ? data.pages : []), [data]);

  const missingDealIds = useMemo(
    () =>
      getMissingDealIds(
        pages.flatMap((page) =>
          page.items.flatMap((row) => (row.dealId ? [row.dealId] : []))
        ),
        deals
      ),
    [pages, deals]
  );

  const { data: fetchedDeals } = useGetDealsByIds(
    missingDealIds,
    missingDealIds.length > 0
  );

  useEffect(() => {
    if (!fetchedDeals?.length) return;

    setDeals(mergeDeals(deals, fetchedDeals));
  }, [fetchedDeals]);

  useEffect(() => {
    if (!isError) return;

    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["activities", "recordTab", "loadErrorToast"])
    });
  }, [isError]);

  const applyCompletion = (taskId: number, isCompleted: boolean): void => {
    setTaskCompletions((current) => ({ ...current, [taskId]: isCompleted }));
  };

  const handleToggleError = ({
    id: taskId,
    isCompleted
  }: CrmTaskCompletionPayload): void => {
    applyCompletion(taskId, !isCompleted);
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

  const typeOptions = [
    ActivityTab.ALL,
    ActivityTab.TASKS,
    ActivityTab.EMAILS,
    ActivityTab.CALLS,
    ActivityTab.MEETINGS
  ].map((tab) => ({
    id: tab,
    value: tab,
    label:
      tab === ActivityTab.ALL
        ? translateText(["activities", "recordTab", "typeFilter", "all"])
        : translateText(["activities", "tabs", tab.toLowerCase()])
  }));

  const resultCount = data ? data.pages[0].totalItems : 0;

  return (
    <div id={id} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <ActivitySearchField
          id={`${id}-search`}
          placeholder={translateText([
            "activities",
            "toolbar",
            "search",
            "placeholders",
            "all"
          ])}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          resultCount={resultCount}
          isResultCountReady={!isLoading && !isError}
        />
        <Dropdown
          id={`${id}-type`}
          options={typeOptions}
          value={activeTab}
          onChange={(value) => onTabChange(value as ActivityTab)}
          variant="secondary"
          size="sm"
          width="9rem"
          ariaLabel={translateAria(["activities", "recordTab", "typeFilter"])}
        />
        <div className="flex items-center gap-3 ml-auto">{actions}</div>
      </div>
      <ActivityFeed
        id={`${id}-feed`}
        activeTab={activeTab}
        pages={pages}
        searchTerm={searchTerm}
        isLoading={isLoading}
        isError={isError}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        timeZone={displayZone}
        taskCompletions={taskCompletions}
        emptyStateText={{
          title: translateText([
            "activities",
            "recordTab",
            "emptyState",
            activeTab.toLowerCase(),
            "title"
          ]),
          description: translateText([
            "activities",
            "recordTab",
            "emptyState",
            activeTab.toLowerCase(),
            "description"
          ])
        }}
        errorMessage={translateText(["activities", "recordTab", "loadError"])}
        isShowTaskCheckbox
        onLoadMore={fetchNextPage}
        onToggleComplete={handleToggleComplete}
      />
    </div>
  );
};

export default RecordActivitiesTab;
