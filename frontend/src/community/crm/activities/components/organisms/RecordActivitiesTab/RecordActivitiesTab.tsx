import { Dropdown } from "@rootcodelabs/skapp-ui";
import { FC, ReactNode, useEffect, useMemo, useState } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useDisplayZone } from "~community/common/hooks/useDisplayZone";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import ActivitySearchField from "~community/crm/activities/components/molecules/ActivitySearchField/ActivitySearchField";
import ActivityFeed from "~community/crm/activities/components/organisms/ActivityFeed/ActivityFeed";
import {
  ActivityRecordType,
  ActivityTab,
  ActivityType,
  RecordActivityFilters
} from "~community/crm/activities/types/activityTypes";
import { useGetRecordActivities } from "~community/crm/api/ActivityApi";
import { useActivityDeals } from "~community/crm/hooks/useActivityDeals";
import { useActivityTaskCompletion } from "~community/crm/hooks/useActivityTaskCompletion";

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

  const { taskCompletions, handleToggleComplete } = useActivityTaskCompletion();

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

  const rows = useMemo(() => pages.flatMap((page) => page.items), [pages]);

  useActivityDeals(rows);

  useEffect(() => {
    if (!isError) return;

    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["activities", "recordTab", "loadErrorToast"])
    });
  }, [isError]);

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
