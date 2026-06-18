import {
  EmptyDataView,
  InputField,
  ProjectTableSkeletonLoader,
  SearchIcon
} from "@rootcodelabs/skapp-ui";
import { ChangeEvent, FC, useMemo, useState } from "react";

import { EmptyStateTypeEnum } from "~community/common/enums/ComponentEnums";
import useDebounce from "~community/common/hooks/useDebounce";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetOpenTasks } from "~community/crm/api/TaskApi";
import { TASK_SEARCH_DEBOUNCE_DELAY } from "~community/crm/constants/taskConstants";
import { CrmTaskTabEnum } from "~community/crm/enums/common";
import { getEmptyStateType } from "~community/crm/utils/commonHelpers";
import { getTaskGroups } from "~community/crm/utils/taskUtil";

import TaskGroup from "../../atoms/TaskGroup/TaskGroup";

interface OpenTasksTabContentProps {
  tab: CrmTaskTabEnum;
}

const OpenTasksTabContent: FC<OpenTasksTabContentProps> = ({ tab }) => {
  const translateText = useTranslator("crmModule", "tasks");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, TASK_SEARCH_DEBOUNCE_DELAY);
  const { userId } = useSessionData();

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const { data: taskData, isLoading, isError } = useGetOpenTasks();

  const { overdue, dueToday, dueTomorrow, upcoming } = useMemo(() => {
    return getTaskGroups(taskData?.tasks ?? [], tab, userId);
  }, [taskData, tab, userId]);

  const emptyStateType = getEmptyStateType(debouncedSearch);

  const isEmpty =
    overdue.length === 0 &&
    dueToday.length === 0 &&
    dueTomorrow.length === 0 &&
    upcoming.length === 0;

  if (isLoading) {
    return <ProjectTableSkeletonLoader rowCount={10} />;
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

  return (
    <div className="flex flex-col h-full gap-4 overflow-hidden">
      <div className="shrink-0">
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
        {isEmpty ? (
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
        ) : (
          <div className="flex flex-col h-full px-2 gap-4 overflow-y-auto">
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
        )}
      </div>
    </div>
  );
};

export default OpenTasksTabContent;
