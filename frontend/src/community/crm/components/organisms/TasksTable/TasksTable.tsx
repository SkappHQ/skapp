import { Tabs } from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";

import { CrmTaskTabEnum } from "~community/crm/enums/common";
import { useGetTasksTabs } from "~community/crm/hooks/useGetTasksTabs";
import TasksTabContent from "../../molecules/TaskTabContent/TaskTabContent";

const TasksTable: FC = () => {
  const tabs = useGetTasksTabs();
  const [activeTab, setActiveTab] = useState(tabs[0]?.id);

  return (
    <div className="flex flex-col gap-4 h-full overflow-hidden">
      <div className="shrink-0">
        <Tabs
          tabs={tabs}
          activeTabId={activeTab}
          onTabChange={(id) => setActiveTab(id as CrmTaskTabEnum)}
        />
        <hr className="border-secondary-accent" />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <TasksTabContent tab={activeTab} />
      </div>
    </div>
  );
};

export default TasksTable;
