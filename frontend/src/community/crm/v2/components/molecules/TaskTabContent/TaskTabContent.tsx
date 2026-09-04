import { EmptyDataView, InputField, SearchIcon } from "@rootcodelabs/skapp-ui";
import {
  ChangeEvent,
  FC,
  startTransition,
  useEffect,
  useMemo,
  useOptimistic,
  useState
} from "react";
import { useShallow } from "zustand/react/shallow";

import {
  SEARCH_DEBOUNCE_DELAY,
  UNPAGINATED_SIZE
} from "~community/common/constants/commonConstants";
import {
  EmptyStateTypeEnum,
  ToastType
} from "~community/common/enums/ComponentEnums";
import useDebounce from "~community/common/hooks/useDebounce";
import { useInfiniteScroll } from "~community/common/hooks/useInfiniteScroll";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { getEmptyStateType } from "~community/common/utils/commonUtil";
import {
  useGetCompletedTasks,
  useGetTasks,
  useUpdateTask
} from "~community/crm/v2/api/TaskApi";
import TaskGroup from "~community/crm/v2/components/molecules/TaskGroup/TaskGroup";
import {
  TASK_PAGE_SIZE,
  TASK_SKELETON_CONFIG
} from "~community/crm/v2/constants/taskConstants";
import { CrmTaskTabEnum } from "~community/crm/v2/enums/common";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import {
  CrmSidePanelTypes,
  CrmTaskFilterRequest
} from "~community/crm/v2/types/CrmTypes";
import {
  applyTaskCompletion,
  getTaskGroups,
  resolveTasks,
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
  const { setToastMessage } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm.trim(), SEARCH_DEBOUNCE_DELAY);

  const { tasks, setTasks, setTaskIds, setSelectedTaskId, openCrmSidePanel } =
    useCrmStoreV2(
      useShallow((store) => ({
        tasks: store.tasks,
        setTasks: store.setTasks,
        setTaskIds: store.setTaskIds,
        setSelectedTaskId: store.setSelectedTaskId,
        openCrmSidePanel: store.openCrmSidePanel
      }))
    );

  const showToggleError = () =>
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["toggleErrorTitle"]),
      description: translateText(["toggleErrorDescription"])
    });

  const { mutateAsync: updateCompletion } = useUpdateTask((updatedTask) => {
    if (updatedTask.id !== undefined) {
      applyCompletion(updatedTask.id, updatedTask.isCompleted === true);
    }
  });

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
    () => completedTaskData?.pages.flatMap((page) => page?.items ?? []) ?? [],
    [completedTaskData]
  );

  const fetchedTasks = useMemo(
    () => (isCompletedTab ? completedTasks : (openTaskData?.items ?? [])),
    [isCompletedTab, completedTasks, openTaskData]
  );

  const visibleTaskIds = useMemo(() => toTaskIds(fetchedTasks), [fetchedTasks]);

  useEffect(() => {
    if (!openTaskData && !completedTaskData) return;

    setTasks(updateTaskRecord(tasks, fetchedTasks));
    setTaskIds(visibleTaskIds);
  }, [openTaskData, completedTaskData, fetchedTasks]);

  const [optimisticTasks, applyOptimisticCompletion] = useOptimistic(
    tasks,
    applyTaskCompletion
  );

  const tasksInView = useMemo(
    () => resolveTasks(visibleTaskIds, optimisticTasks),
    [visibleTaskIds, optimisticTasks]
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

  const handleRowClick = (taskId: number) => {
    setSelectedTaskId(taskId);
    openCrmSidePanel(CrmSidePanelTypes.TASK_SIDE_PANEL);
  };

  const applyCompletion = (taskId: number, completed: boolean) => {
    setTasks(updateTaskRecord(tasks, [{ id: taskId, isCompleted: completed }]));
  };

  const handleToggleComplete = (taskId: number, completed: boolean) => {
    startTransition(async () => {
      applyOptimisticCompletion({ taskId, isCompleted: completed });

      await updateCompletion({
        id: taskId,
        task: { isCompleted: completed }
      }).catch(showToggleError);
    });
  };

  const renderOpenTasksContent = () => (
    <div className="flex flex-col flex-1 min-h-0 px-2 pb-4 gap-4 overflow-y-auto">
      {overdue.length > 0 && (
        <TaskGroup
          label={translateText(["table", "groupLabels", "overdue"])}
          tasks={overdue}
          onRowClick={handleRowClick}
          onToggleComplete={handleToggleComplete}
        />
      )}
      {dueToday.length > 0 && (
        <TaskGroup
          label={translateText(["table", "groupLabels", "dueToday"])}
          tasks={dueToday}
          onRowClick={handleRowClick}
          onToggleComplete={handleToggleComplete}
        />
      )}
      {dueTomorrow.length > 0 && (
        <TaskGroup
          label={translateText(["table", "groupLabels", "dueTomorrow"])}
          tasks={dueTomorrow}
          onRowClick={handleRowClick}
          onToggleComplete={handleToggleComplete}
        />
      )}
      {upcoming.length > 0 && (
        <TaskGroup
          label={translateText(["table", "groupLabels", "upcoming"])}
          tasks={upcoming}
          onRowClick={handleRowClick}
          onToggleComplete={handleToggleComplete}
        />
      )}
    </div>
  );

  const renderCompletedTasksContent = () => (
    <div className="flex flex-col h-full px-2 pb-4 gap-4 overflow-y-auto">
      <TaskGroup
        tasks={tasksInView}
        isCheckTaskVisible={false}
        onRowClick={handleRowClick}
        onToggleComplete={handleToggleComplete}
      />
      <div ref={loadingRef} />
    </div>
  );

  const isLoading = isCompletedTab
    ? isCompletedTasksLoading
    : isOpenTasksLoading;
  const isError = isCompletedTab ? isCompletedTasksError : isOpenTasksError;

  const renderContent = () => {
    if (isLoading) {
      const skeletonProps = isCompletedTab
        ? TASK_SKELETON_CONFIG.COMPLETED
        : TASK_SKELETON_CONFIG.OPEN;

      return <TaskTabSkeleton {...skeletonProps} />;
    }

    if (isError) {
      return (
        <EmptyDataView
          title={translateText(["table", "errorState", "title"])}
          description={translateText(["table", "errorState", "description"])}
          icon={<SearchIcon />}
        />
      );
    }

    const isEmpty = isCompletedTab
      ? visibleTaskIds.length === 0
      : isOpenTasksEmpty;

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
