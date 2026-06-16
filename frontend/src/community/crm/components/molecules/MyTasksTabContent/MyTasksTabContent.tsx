import { EmptyDataView, SearchIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { EmptyStateTypeEnum } from "~community/common/enums/ComponentEnums";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetOpenTasks } from "~community/crm/api/TaskApi";
import { TASK_SEARCH_DEBOUNCE_DELAY } from "~community/crm/constants/taskConstants";
import { CrmTaskDetailType } from "~community/crm/types/CommonTypes";
import {
  isDueToday,
  isDueTomorrow,
  isOverdue
} from "~community/crm/utils/taskValidations";

import TaskGroup from "../../atoms/TaskGroup/TaskGroup";

const groupTasksByDueDate = (tasks: CrmTaskDetailType[]) => {
  const overdue: CrmTaskDetailType[] = [];
  const dueToday: CrmTaskDetailType[] = [];
  const dueTomorrow: CrmTaskDetailType[] = [];
  const upcoming: CrmTaskDetailType[] = [];

  for (const task of tasks) {
    if (!task.dueAt) {
      upcoming.push(task);
    } else if (isOverdue(task.dueAt)) {
      overdue.push(task);
    } else if (isDueToday(task.dueAt)) {
      dueToday.push(task);
    } else if (isDueTomorrow(task.dueAt)) {
      dueTomorrow.push(task);
    } else {
      upcoming.push(task);
    }
  }

  return { overdue, dueToday, dueTomorrow, upcoming };
};

interface MyTasksTabContentProps {
  searchTerm: string;
}

const MyTasksTabContent: FC<MyTasksTabContentProps> = ({ searchTerm }) => {
  const translateText = useTranslator("crmModule", "tasks");
  const debouncedSearch = useDebounce(searchTerm, TASK_SEARCH_DEBOUNCE_DELAY);

  const { data: taskData } = useGetOpenTasks();

  const tasks = taskData?.tasks || [];

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
  );
};

export default MyTasksTabContent;
