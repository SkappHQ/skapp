import { EmptyDataView, InputField, SearchIcon } from "@rootcodelabs/skapp-ui";
import { ChangeEvent, FC, useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { UNPAGINATED_SIZE } from "~community/common/constants/commonConstants";
import { EmptyStateTypeEnum } from "~community/common/enums/ComponentEnums";
import useDebounce from "~community/common/hooks/useDebounce";
import { useInfiniteScroll } from "~community/common/hooks/useInfiniteScroll";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { getEmptyStateType } from "~community/common/utils/commonUtil";
import { SEARCH_DEBOUNCE_DELAY } from "~community/crm/constants/commonConstants";
import { useGetDealsByIds } from "~community/crm/v2/api/DealApi";
import {
  useGetCompletedTasks,
  useGetTasks
} from "~community/crm/v2/api/TaskApi";
import TaskGroup from "~community/crm/v2/components/atoms/TaskGroup/TaskGroup";
import {
  TASK_PAGE_SIZE,
  TASK_SKELETON_CONFIG
} from "~community/crm/v2/constants/taskConstants";
import { CrmTaskTabEnum } from "~community/crm/v2/enums/common";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmTaskFilterRequest } from "~community/crm/v2/types/CrmTypes";
import {
  getMissingDealIds,
  mergeDeals
} from "~community/crm/v2/utils/dealUtil";
import {
  getTaskGroups,
  resolveTasks,
  toTaskDealIds,
  toTaskIds,
  updateTaskRecord
} from "~community/crm/v2/utils/taskUtil";

import TaskTabSkeleton from "./TaskTabSkeleton";

interface Props {
  tab: CrmTaskTabEnum;
}

const TaskTabContent: FC<Props> = ({ tab }) => {
  const translateText = useTranslator("crmModule", "tasks");
  const { userId } = useSessionData();

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, SEARCH_DEBOUNCE_DELAY);

  const { tasks, taskIds, deals, setTasks, setTaskIds, setDeals } =
    useCrmStoreV2(
      useShallow((store) => ({
        tasks: store.tasks,
        taskIds: store.taskIds,
        deals: store.deals,
        setTasks: store.setTasks,
        setTaskIds: store.setTaskIds,
        setDeals: store.setDeals
      }))
    );

  const isCompletedTab = tab === CrmTaskTabEnum.COMPLETED_TASKS;

  const openTasksFilter: CrmTaskFilterRequest = useMemo(
    () => ({
      searchKeyword: debouncedSearch,
      isCompleted: false,
      size: UNPAGINATED_SIZE
    }),
    [debouncedSearch]
  );

  const completedTasksFilter: CrmTaskFilterRequest = useMemo(
    () => ({
      searchKeyword: debouncedSearch,
      isCompleted: true,
      size: TASK_PAGE_SIZE
    }),
    [debouncedSearch]
  );

  const {
    data: openTaskData,
    isLoading: isOpenTasksLoading,
    isError: isOpenTasksError
  } = useGetTasks(openTasksFilter, !isCompletedTab);

  const {
    data: completedTaskData,
    isLoading: isCompletedTasksLoading,
    isError: isCompletedTasksError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGetCompletedTasks(completedTasksFilter, isCompletedTab);

  const completedTasks = useMemo(
    () => completedTaskData?.pages.flatMap((page) => page.items) ?? [],
    [completedTaskData]
  );

  const fetchedTasks = useMemo(
    () => (isCompletedTab ? completedTasks : (openTaskData?.items ?? [])),
    [isCompletedTab, completedTasks, openTaskData]
  );

  useEffect(() => {
    if (!openTaskData && !completedTaskData) return;

    setTasks(updateTaskRecord(tasks, fetchedTasks));
    setTaskIds(toTaskIds(fetchedTasks));
  }, [openTaskData, completedTaskData, fetchedTasks]);

  const missingDealIds = useMemo(
    () => getMissingDealIds(toTaskDealIds(fetchedTasks), deals),
    [fetchedTasks, deals]
  );

  const { data: fetchedDeals } = useGetDealsByIds(
    missingDealIds,
    missingDealIds.length > 0
  );

  useEffect(() => {
    if (!fetchedDeals?.length) return;

    setDeals(mergeDeals(deals, fetchedDeals));
  }, [fetchedDeals]);

  const tasksInView = useMemo(
    () => resolveTasks(taskIds, tasks),
    [taskIds, tasks]
  );

  const { overdue, dueToday, dueTomorrow, upcoming, isOpenTasksEmpty } =
    useMemo(
      () => getTaskGroups(tasksInView, tab, userId),
      [tasksInView, tab, userId]
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
    if (isOpenTasksLoading || isCompletedTasksLoading) {
      const skeletonProps = isCompletedTab
        ? TASK_SKELETON_CONFIG.COMPLETED
        : TASK_SKELETON_CONFIG.OPEN;

      return <TaskTabSkeleton {...skeletonProps} />;
    }

    if (isOpenTasksError || isCompletedTasksError) {
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
