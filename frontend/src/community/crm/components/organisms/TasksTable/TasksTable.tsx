import {
  InputField,
  ProjectTableSkeletonLoader,
  SearchIcon,
  Table,
  Tabs
} from "@rootcodelabs/skapp-ui";
import { ChangeEvent, useState } from "react";

import { EmptyStateTypeEnum } from "~community/common/enums/ComponentEnums";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { TASK_SEARCH_DEBOUNCE_DELAY } from "~community/crm/constants/taskConstants";
import { useGetTasksTabs } from "~community/crm/hooks/useGetTasksTabs";

const TasksTable = () => {
  const translateText = useTranslator("crmModule", "tasks");

  const tabs = useGetTasksTabs();
  const [activeTab, setActiveTab] = useState(tabs[0]?.id);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, TASK_SEARCH_DEBOUNCE_DELAY);
  const emptyStateType =
    debouncedSearch.trim() === ""
      ? EmptyStateTypeEnum.NO_DATA
      : EmptyStateTypeEnum.NO_SEARCH_RESULTS;

  const handleTabChange = (id: string) => {
    setActiveTab(id);
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <Tabs tabs={tabs} activeTabId={activeTab} onTabChange={handleTabChange} />
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-row gap-4 w-full h-[3rem] items-center pb-2">
          <InputField
            ariaLabelClearButton={translateText([
              "table",
              "clearButtonAriaLabel"
            ])}
            className="w-[25.75rem] h-[3rem]"
            placeholder={translateText(["table", "search"])}
            rightIcon={<SearchIcon />}
            state="default"
            type="search"
            value={searchTerm}
            onChange={handleSearchChange}
            customStyles={{ borderRadius: "rounded-[1.5rem]" }}
          />
        </div>
        <Table
          columns={[]}
          data={[]}
          emptyStateType={emptyStateType}
          isLoading={false}
          customSkeletonLoader={<ProjectTableSkeletonLoader rowCount={8} />}
          height="34.5rem"
          hasMore={false}
          infiniteScrollLoadingMessage={translateText([
            "table",
            "infiniteScrollLoadingMessage"
          ])}
          noDataState={{
            icon: <SearchIcon />,
            title: translateText(["table", "emptyDataState", "title"]),
            description: translateText([
              "table",
              "emptyDataState",
              "description"
            ])
          }}
          noSearchResultsState={{
            icon: <SearchIcon />,
            title: translateText(["table", "emptySearchState", "title"]),
            description: translateText([
              "table",
              "emptySearchState",
              "description"
            ])
          }}
        />
      </div>
    </div>
  );
};

export default TasksTable;
