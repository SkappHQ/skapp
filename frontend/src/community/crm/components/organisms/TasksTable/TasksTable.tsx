import { InputField, SearchIcon, Tabs } from "@rootcodelabs/skapp-ui";
import { ChangeEvent, FC, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetTasksTabs } from "~community/crm/hooks/useGetTasksTabs";

import MyTasksTabContent from "../../molecules/MyTasksTabContent/MyTasksTabContent";

const TasksTable: FC = () => {
  const translateText = useTranslator("crmModule", "tasks");

  const tabs = useGetTasksTabs();
  const [activeTab, setActiveTab] = useState(tabs[0]?.id);

  const handleTabChange = (id: string) => {
    setActiveTab(id);
  };

  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="flex flex-col gap-4 w-full grow min-h-0">
      <div className="flex flex-col pb-1">
        <Tabs
          tabs={tabs}
          activeTabId={activeTab}
          onTabChange={handleTabChange}
        />
        <hr className="border-secondary-accent" />
      </div>
      <div className="flex flex-col w-full grow min-h-0 overflow-y-auto gap-6">
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
        />
        {activeTab === "my-tasks" && (
          <MyTasksTabContent searchTerm={searchTerm} />
        )}
      </div>
    </div>
  );
};

export default TasksTable;
