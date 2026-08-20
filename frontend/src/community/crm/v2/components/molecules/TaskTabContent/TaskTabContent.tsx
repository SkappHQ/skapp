import { EmptyDataView, InputField, SearchIcon } from "@rootcodelabs/skapp-ui";
import { ChangeEvent, FC, useEffect, useMemo, useState } from "react";

import { EmptyStateTypeEnum } from "~community/common/enums/ComponentEnums";
import useDebounce from "~community/common/hooks/useDebounce";
import { useInfiniteScroll } from "~community/common/hooks/useInfiniteScroll";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
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
  collectMissingTaskCompanyIds,
  collectMissingTaskDealIds,
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

  const {
    tasks,
    taskIds,
    deals,
    companies,
    setTasks,
    setTaskIds,
    setDeals,
    setCompanies
  } = useCrmStoreV2((state) => ({
    tasks: state.tasks,
    taskIds: state.taskIds,
    deals: state.deals,
    companies: state.companies,
    setTasks: state.setTasks,
    setTaskIds: state.setTaskIds,
    setDeals: state.setDeals,
    setCompanies: state.setCompanies
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

  const responseTasks = useMemo(
    () =>
      isCompletedTab
        ? (completedTaskData?.pages.flatMap((page) => page?.items ?? []) ?? [])
        : (openTaskData?.items ?? []),
    [isCompletedTab, completedTaskData, openTaskData]
  );

  const dealIds = useMemo(
    () => collectMissingTaskDealIds(responseTasks, deals),
    [responseTasks, deals]
  );
  const companyIds = useMemo(
    () => collectMissingTaskCompanyIds(responseTasks, companies),
    [responseTasks, companies]
  );

  const { data: dealsData } = useGetDealsByIds(dealIds, dealIds.length > 0);
  const { data: companiesData } = useGetCompaniesByIds(
    companyIds,
    companyIds.length > 0
  );

  useEffect(() => {
    if (responseTasks.length > 0) {
      setTasks(mergeEntityRecord(tasks, toTasksRecord(responseTasks)));
      setTaskIds(replaceTaskIds(responseTasks));
    }

    if (dealsData) {
      setDeals(mergeEntityRecord(deals, toDealsRecord(dealsData)));
    }

    if (companiesData) {
      setCompanies(
        mergeEntityRecord(companies, toCompaniesRecord(companiesData))
      );
    }
  }, [responseTasks, dealsData, companiesData]);

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
