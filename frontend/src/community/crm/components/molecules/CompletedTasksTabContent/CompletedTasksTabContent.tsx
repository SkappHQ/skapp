import {
  EmptyDataView,
  InputField,
  ProjectTableSkeletonLoader,
  SearchIcon
} from "@rootcodelabs/skapp-ui";
import { ChangeEvent, FC, useMemo, useState } from "react";

import { EmptyStateTypeEnum } from "~community/common/enums/ComponentEnums";
import useDebounce from "~community/common/hooks/useDebounce";
import useInfiniteScroll from "~community/crm/hooks/useInfiniteScroll";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetCompletedTasks } from "~community/crm/api/TaskApi";
import {
  DEFAULT_PAGE_SIZE,
  TASK_SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/taskConstants";
import { getEmptyStateType } from "~community/crm/utils/crmUtil";

import TaskGroup from "../../atoms/TaskGroup/TaskGroup";

const CompletedTasksTabContent: FC = () => {
  const translateText = useTranslator("crmModule", "tasks");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, TASK_SEARCH_DEBOUNCE_DELAY);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const {
    data: taskData,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGetCompletedTasks(debouncedSearch, DEFAULT_PAGE_SIZE);

  const emptyStateType = getEmptyStateType(debouncedSearch);

  const tasks = useMemo(
    () => taskData?.pages.flatMap((page) => page?.items ?? []) ?? [],
    [taskData]
  );

  const scrollRef = useInfiniteScroll<HTMLDivElement>({
    hasNextPage: hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  });

  const renderContent = () => {
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
      <div
        ref={scrollRef}
        className="flex flex-col flex-1 min-h-0 px-2 pb-4 gap-4 overflow-y-auto"
      >
        <TaskGroup
          tasks={tasks}
          isCheckTaskVisible={false}
        />
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

export default CompletedTasksTabContent;
