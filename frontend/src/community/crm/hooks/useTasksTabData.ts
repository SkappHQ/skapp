import { useEffect, useMemo } from "react";

import { useInfiniteScroll } from "~community/common/hooks/useInfiniteScroll";
import {
  useGetCompletedTasks,
  useGetOpenTasks
} from "~community/crm/api/TaskApi";
import { TASK_PAGE_SIZE } from "~community/crm/constants/taskConstants";
import { CrmTaskGroupEnum, CrmTaskTabEnum } from "~community/crm/enums/common";
import { useCrmStore } from "~community/crm/store/store";
import { CrmTaskDetailType } from "~community/crm/types/CommonTypes";
import { getTaskGroups } from "~community/crm/utils/taskUtil";

export const useTasksTabData = (
  tab: CrmTaskTabEnum,
  searchKeyword: string,
  userId: number | undefined
) => {
  const { tasks, setTasks } = useCrmStore((store) => ({
    tasks: store.tasks,
    setTasks: store.setTasks
  }));

  const isOpenTab =
    tab === CrmTaskTabEnum.MY_TASKS || tab === CrmTaskTabEnum.ALL_TASKS;

  const {
    data: openTaskData,
    isLoading: isOpenTasksLoading,
    isError: isOpenTasksError
  } = useGetOpenTasks(searchKeyword, isOpenTab);

  const {
    data: completedTaskData,
    isLoading: isCompletedTasksLoading,
    isError: isCompletedTasksError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGetCompletedTasks(
    searchKeyword,
    TASK_PAGE_SIZE,
    tab === CrmTaskTabEnum.COMPLETED_TASKS
  );

  const completedFromQuery = useMemo(
    () => completedTaskData?.pages.flatMap((page) => page?.items) ?? [],
    [completedTaskData]
  );

  useEffect(() => {
    if (openTaskData?.tasks) {
      setTasks(openTaskData.tasks, CrmTaskGroupEnum.OPEN);
    }
  }, [openTaskData, setTasks]);

  useEffect(() => {
    if (completedTaskData) {
      setTasks(completedFromQuery, CrmTaskGroupEnum.COMPLETED);
    }
  }, [completedTaskData, completedFromQuery, setTasks]);

  const openTaskGroups = useMemo(
    () =>
      getTaskGroups(
        tasks.filter((task) => !task.isCompleted),
        tab,
        userId
      ),
    [tasks, tab, userId]
  );

  const completedTasks: CrmTaskDetailType[] = useMemo(
    () => tasks.filter((task) => task.isCompleted),
    [tasks]
  );

  const { loadingRef } = useInfiniteScroll({
    hasNextPage,
    isLoading: isFetchingNextPage,
    onLoadMore: fetchNextPage
  });

  return {
    ...openTaskGroups,
    completedTasks,
    loadingRef,
    isLoading: isOpenTasksLoading || isCompletedTasksLoading,
    isError: isOpenTasksError || isCompletedTasksError
  };
};
