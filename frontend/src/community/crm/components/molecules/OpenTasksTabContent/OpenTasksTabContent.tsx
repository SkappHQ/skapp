import { EmptyDataView, InputField, SearchIcon } from "@rootcodelabs/skapp-ui";
import { ChangeEvent, FC, useState } from "react";

import { EmptyStateTypeEnum } from "~community/common/enums/ComponentEnums";
import useDebounce from "~community/common/hooks/useDebounce";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetOpenTasks } from "~community/crm/api/TaskApi";
import { TASK_SEARCH_DEBOUNCE_DELAY } from "~community/crm/constants/taskConstants";
import { groupTasksByDueDate } from "~community/crm/utils/taskUtils";

import TaskGroup from "../../atoms/TaskGroup/TaskGroup";

interface OpenTasksTabContentProps {
  isMyTasks?: boolean;
}

const OpenTasksTabContent: FC<OpenTasksTabContentProps> = ({
  isMyTasks = false
}) => {
  const translateText = useTranslator("crmModule", "tasks");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, TASK_SEARCH_DEBOUNCE_DELAY);
  const { userId } = useSessionData();

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const { data: taskData } = useGetOpenTasks();

  const allTasks = taskData?.tasks || [];
  const tasks = isMyTasks
    ? allTasks.filter((task) => task.owner.employeeId === userId)
    : allTasks;

  const { overdue, dueToday, dueTomorrow, upcoming } =
    groupTasksByDueDate(tasks);

  const emptyStateType =
    debouncedSearch.trim() === ""
      ? EmptyStateTypeEnum.NO_DATA
      : EmptyStateTypeEnum.NO_SEARCH_RESULTS;

  if (tasks.length === 0) {
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

  return (
    <div className="flex flex-col w-full gap-4">
      <InputField
        ariaLabelClearButton={translateText(["table", "clearButtonAriaLabel"])}
        className="w-[25.75rem] h-[3rem]"
        placeholder={translateText(["table", "search"])}
        rightIcon={<SearchIcon />}
        value={searchTerm}
        onChange={handleSearchChange}
        customStyles={{ borderRadius: "rounded-[1.5rem]" }}
      />
      <div className="flex flex-col w-full grow h-[65vh] px-2 gap-4 overflow-auto">
        <TaskGroup
          label={translateText(["table", "groupLabels", "overdue"])}
          tasks={overdue}
        />
        <TaskGroup
          label={translateText(["table", "groupLabels", "dueToday"])}
          tasks={dueToday}
        />
        <TaskGroup
          label={translateText(["table", "groupLabels", "dueTomorrow"])}
          tasks={dueTomorrow}
        />
        <TaskGroup
          label={translateText(["table", "groupLabels", "upcoming"])}
          tasks={upcoming}
        />
      </div>
    </div>
  );
};

export default OpenTasksTabContent;
