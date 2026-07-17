import { EmptyDataView, InputField, SearchIcon } from "@rootcodelabs/skapp-ui";
import { ChangeEvent, FC, useState } from "react";

import { EmptyStateTypeEnum } from "~community/common/enums/ComponentEnums";
import useDebounce from "~community/common/hooks/useDebounce";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  TASK_SEARCH_DEBOUNCE_DELAY,
  TASK_SKELETON_CONFIG
} from "~community/crm/constants/taskConstants";
import { CrmTaskTabEnum } from "~community/crm/enums/common";
import { useTasksTabData } from "~community/crm/hooks/useTasksTabData";
import { getEmptyStateType } from "~community/crm/utils/crmUtil";

import TaskGroup from "../../atoms/TaskGroup/TaskGroup";
import TaskTabSkeleton from "./TaskTabSkeleton";

interface TaskTabContentProps {
  tab: CrmTaskTabEnum;
}

const TaskTabContent: FC<TaskTabContentProps> = ({ tab }) => {
  const translateText = useTranslator("crmModule", "tasks");
  const { userId } = useSessionData();

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, TASK_SEARCH_DEBOUNCE_DELAY);

  const {
    overdue,
    dueToday,
    dueTomorrow,
    upcoming,
    isOpenTasksEmpty,
    completedTasks,
    loadingRef,
    isLoading,
    isError
  } = useTasksTabData(tab, debouncedSearch, userId);

  const emptyStateType = getEmptyStateType(debouncedSearch);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const renderContent = () => {
    if (isLoading) {
      const skeletonProps =
        tab === CrmTaskTabEnum.COMPLETED_TASKS
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

    const isEmpty =
      tab === CrmTaskTabEnum.COMPLETED_TASKS
        ? completedTasks.length === 0
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

    switch (tab) {
      case CrmTaskTabEnum.MY_TASKS:
      case CrmTaskTabEnum.ALL_TASKS:
        return renderOpenTasksContent();
      case CrmTaskTabEnum.COMPLETED_TASKS:
        return renderCompletedTasksContent();
      default:
        return <></>;
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

export default TaskTabContent;
