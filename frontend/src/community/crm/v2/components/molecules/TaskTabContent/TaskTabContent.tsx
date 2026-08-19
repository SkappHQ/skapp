import { EmptyDataView, InputField, SearchIcon } from "@rootcodelabs/skapp-ui";
import { ChangeEvent, FC, useEffect, useMemo, useState } from "react";

import { EmptyStateTypeEnum } from "~community/common/enums/ComponentEnums";
import useDebounce from "~community/common/hooks/useDebounce";
import { useInfiniteScroll } from "~community/common/hooks/useInfiniteScroll";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
// Presentational only - no store or v1 types, so it is reused as is.
import TaskTabSkeleton from "~community/crm/components/molecules/TaskTabContent/TaskTabSkeleton";
import {
  TASK_PAGE_SIZE,
  TASK_SEARCH_DEBOUNCE_DELAY,
  TASK_SKELETON_CONFIG
} from "~community/crm/constants/taskConstants";
import { getEmptyStateType } from "~community/crm/utils/crmUtil";
import { useGetCompaniesByIds } from "~community/crm/v2/api/CompanyApi";
import { useGetDealsByIds } from "~community/crm/v2/api/DealApi";
import {
  useGetCompletedTasks,
  useGetOpenTasks
} from "~community/crm/v2/api/TaskApi";
import TaskGroup from "~community/crm/v2/components/atoms/TaskGroup/TaskGroup";
import { CrmTaskTabEnum } from "~community/crm/v2/enums/common";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import {
  collectTaskCompanyIds,
  collectTaskDealIds,
  mergeEntityRecord,
  replaceTaskIds,
  toCompaniesRecord,
  toDealsRecord,
  toTasksRecord
} from "~community/crm/v2/utils/crmEntityUtils";
import { getTaskGroups } from "~community/crm/v2/utils/crmTaskUtils";

interface TaskTabContentProps {
  tab: CrmTaskTabEnum;
}

const TaskTabContent: FC<TaskTabContentProps> = ({ tab }) => {
  const translateText = useTranslator("crmModule", "tasks");
  const { userId } = useSessionData();

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, TASK_SEARCH_DEBOUNCE_DELAY);

  const { tasks, taskIds } = useCrmStoreV2((state) => ({
    tasks: state.tasks,
    taskIds: state.taskIds
  }));

  const isCompletedTab = tab === CrmTaskTabEnum.COMPLETED_TASKS;

  const {
    data: completedTaskData,
    isLoading: isCompletedTasksLoading,
    isError: isCompletedTasksError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGetCompletedTasks(
    { searchKeyword: debouncedSearch, size: TASK_PAGE_SIZE },
    isCompletedTab
  );

  const {
    data: openTaskData,
    isLoading: isOpenTasksLoading,
    isError: isOpenTasksError
  } = useGetOpenTasks({ searchKeyword: debouncedSearch }, !isCompletedTab);

  const visibleTasks = useMemo(() => {
    if (isCompletedTab) {
      return (
        completedTaskData?.pages.flatMap((page) => page?.items ?? []) ?? []
      );
    }
    return openTaskData?.items ?? [];
  }, [isCompletedTab, completedTaskData, openTaskData]);

  /**
   * The response carries id references only, so the tasks go in as they are and
   * the ids they point at are resolved by the batch lookups below. Switching
   * tabs only swaps the displayed ids - the new tasks are merged in, so tasks
   * already loaded from another tab stay in the record rather than being
   * dropped.
   */
  useEffect(() => {
    if (visibleTasks.length === 0) return;

    const { tasks, setTasks, setTaskIds } = useCrmStoreV2.getState();

    setTasks(mergeEntityRecord(tasks, toTasksRecord(visibleTasks)));
    setTaskIds(replaceTaskIds(visibleTasks));
  }, [visibleTasks]);

  /**
   * Contacts and owners are already in the store from the CRM lookup set, so
   * only deals and companies have to be fetched for whatever the visible tasks
   * reference.
   */
  const dealIds = useMemo(
    () => collectTaskDealIds(visibleTasks),
    [visibleTasks]
  );
  const companyIds = useMemo(
    () => collectTaskCompanyIds(visibleTasks),
    [visibleTasks]
  );

  const { data: dealsData } = useGetDealsByIds(dealIds, dealIds.length > 0);
  const { data: companiesData } = useGetCompaniesByIds(
    companyIds,
    companyIds.length > 0
  );

  useEffect(() => {
    if (!dealsData) return;
    const { deals, setDeals } = useCrmStoreV2.getState();
    setDeals(mergeEntityRecord(deals, toDealsRecord(dealsData)));
  }, [dealsData]);

  useEffect(() => {
    if (!companiesData) return;
    const { companies, setCompanies } = useCrmStoreV2.getState();
    setCompanies(
      mergeEntityRecord(companies, toCompaniesRecord(companiesData))
    );
  }, [companiesData]);

  const { overdue, dueToday, dueTomorrow, upcoming, isOpenTasksEmpty } =
    useMemo(
      () => getTaskGroups(taskIds, tasks, tab, userId),
      [taskIds, tasks, tab, userId]
    );

  const { loadingRef } = useInfiniteScroll({
    hasNextPage,
    isLoading: isFetchingNextPage,
    onLoadMore: fetchNextPage
  });

  const emptyStateType = getEmptyStateType(debouncedSearch);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const renderOpenTasksContent = () => (
    <div className="flex flex-col flex-1 min-h-0 px-2 pb-4 gap-4 overflow-y-auto">
      {overdue.length > 0 && (
        <TaskGroup
          label={translateText(["table", "groupLabels", "overdue"])}
          taskIds={overdue}
        />
      )}
      {dueToday.length > 0 && (
        <TaskGroup
          label={translateText(["table", "groupLabels", "dueToday"])}
          taskIds={dueToday}
        />
      )}
      {dueTomorrow.length > 0 && (
        <TaskGroup
          label={translateText(["table", "groupLabels", "dueTomorrow"])}
          taskIds={dueTomorrow}
        />
      )}
      {upcoming.length > 0 && (
        <TaskGroup
          label={translateText(["table", "groupLabels", "upcoming"])}
          taskIds={upcoming}
        />
      )}
    </div>
  );

  const renderCompletedTasksContent = () => (
    <div className="flex flex-col h-full px-2 pb-4 gap-4 overflow-y-auto">
      <TaskGroup taskIds={taskIds} isCheckTaskVisible={false} />
      <div ref={loadingRef} />
    </div>
  );

  const renderContent = () => {
    if (isCompletedTasksLoading || isOpenTasksLoading) {
      const skeletonProps = isCompletedTab
        ? TASK_SKELETON_CONFIG.COMPLETED
        : TASK_SKELETON_CONFIG.OPEN;

      return <TaskTabSkeleton {...skeletonProps} />;
    }

    if (isCompletedTasksError || isOpenTasksError) {
      return (
        <EmptyDataView
          title={translateText(["table", "errorState", "title"])}
          description={translateText(["table", "errorState", "description"])}
          icon={<SearchIcon />}
        />
      );
    }

    const isEmpty = isCompletedTab ? taskIds.length === 0 : isOpenTasksEmpty;

    if (isEmpty) {
      return (
        <EmptyDataView
          title={
            emptyStateType === EmptyStateTypeEnum.NO_DATA
              ? translateText(["table", "emptyDataState", "title"])
              : translateText(["table", "emptySearchState", "title"])
          }
          description={
            emptyStateType === EmptyStateTypeEnum.NO_DATA
              ? translateText(["table", "emptyDataState", "description"])
              : translateText(["table", "emptySearchState", "description"])
          }
          icon={<SearchIcon />}
        />
      );
    }

    return isCompletedTab
      ? renderCompletedTasksContent()
      : renderOpenTasksContent();
  };

  return (
    <div className="flex flex-col h-full gap-4 overflow-hidden">
      <div className="p-1">
        <InputField
          ariaLabelClearButton={translateText([
            "table",
            "clearButtonAriaLabel"
          ])}
          className="w-[25.75rem] h-[3rem]"
          placeholder={translateText(["table", "search"])}
          rightIcon={<SearchIcon />}
          value={searchTerm}
          onChange={handleSearchChange}
          customStyles={{ borderRadius: "rounded-[1.5rem]" }}
          type="search"
          state="default"
        />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};

export default TaskTabContent;
