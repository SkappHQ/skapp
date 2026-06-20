import {
  EmptyDataView,
  InputField,
  ProjectTableSkeletonLoader,
  SearchIcon
} from "@rootcodelabs/skapp-ui";
import { ChangeEvent, FC, useMemo, useState } from "react";

import { EmptyStateTypeEnum } from "~community/common/enums/ComponentEnums";
import useDebounce from "~community/common/hooks/useDebounce";
import { useInfiniteScroll } from "~community/common/hooks/useInfiniteScroll";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  useGetCompletedTasks,
  useGetOpenTasks
} from "~community/crm/api/TaskApi";
import {
  DEFAULT_PAGE_SIZE,
  TASK_SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/taskConstants";
import { CrmTaskTabEnum } from "~community/crm/enums/common";
import { getEmptyStateType } from "~community/crm/utils/crmUtil";
import { getTaskGroups } from "~community/crm/utils/taskUtil";

import TaskGroup from "../../atoms/TaskGroup/TaskGroup";

interface TasksTabContentProps {
  tab: CrmTaskTabEnum;
}

const TasksTabContent: FC<TasksTabContentProps> = ({ tab }) => {
  const translateText = useTranslator("crmModule", "tasks");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, TASK_SEARCH_DEBOUNCE_DELAY);
  const { userId } = useSessionData();

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const {
    data: completedTaskData,
    isLoading: isCompletedTasksLoading,
    isError: isCompletedTasksError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGetCompletedTasks(
    debouncedSearch,
    DEFAULT_PAGE_SIZE,
    tab === CrmTaskTabEnum.COMPLETED_TASKS
  );

  const {
    data: openTaskData,
    isLoading: isOpenTasksLoading,
    isError: isOpenTasksError
  } = useGetOpenTasks(
    debouncedSearch,
    tab === CrmTaskTabEnum.MY_TASKS || tab === CrmTaskTabEnum.TEAM_TASKS
  );

  const { overdue, dueToday, dueTomorrow, upcoming, isEmpty } = useMemo(() => {
    return getTaskGroups(openTaskData?.tasks ?? [], tab, userId);
  }, [openTaskData, tab, userId]);

  const { loadingRef } = useInfiniteScroll({
    hasNextPage,
    isLoading: isFetchingNextPage,
    onLoadMore: fetchNextPage
  });

  const emptyStateType = getEmptyStateType(debouncedSearch);

  const completedTasks = useMemo(
    () => completedTaskData?.pages.flatMap((page) => page?.items ?? []) ?? [],
    [completedTaskData]
  );

  const renderContent = () => {
    if (isCompletedTasksLoading || isOpenTasksLoading) {
      return <ProjectTableSkeletonLoader rowCount={10} />;
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

    const isTasksEmpty = isEmpty && completedTasks.length === 0;

    if (isTasksEmpty) {
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

    switch (tab) {
      case CrmTaskTabEnum.MY_TASKS:
      case CrmTaskTabEnum.TEAM_TASKS:
        return renderOpenTasksContent();
      case CrmTaskTabEnum.COMPLETED_TASKS:
        return renderCompletedTasksContent();
      default:
        return null;
    }
  };

  const renderOpenTasksContent = () => {
    return (
      <div className="flex flex-col flex-1 min-h-0 px-2 pb-4 gap-4 overflow-y-auto">
        {overdue.length > 0 && (
          <TaskGroup
            label={translateText(["table", "groupLabels", "overdue"])}
            tasks={overdue}
          />
        )}
        {dueToday.length > 0 && (
          <TaskGroup
            label={translateText(["table", "groupLabels", "dueToday"])}
            tasks={dueToday}
          />
        )}
        {dueTomorrow.length > 0 && (
          <TaskGroup
            label={translateText(["table", "groupLabels", "dueTomorrow"])}
            tasks={dueTomorrow}
          />
        )}
        {upcoming.length > 0 && (
          <TaskGroup
            label={translateText(["table", "groupLabels", "upcoming"])}
            tasks={upcoming}
          />
        )}
      </div>
    );
  };

  const renderCompletedTasksContent = () => {
    return (
      <div className="flex flex-col h-full px-2 pb-4 gap-4 overflow-y-auto">
        <TaskGroup tasks={completedTasks} isCheckTaskVisible={false} />
        <div ref={loadingRef} />
      </div>
    );
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

export default TasksTabContent;
