import { Tabs } from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";

import TaskTabContent from "~community/crm/components/molecules/TaskTabContent/TaskTabContent";
import { CrmTaskTabEnum } from "~community/crm/enums/common";
import { useGetTasksTabs } from "~community/crm/hooks/useGetTasksTabs";

const TasksTable: FC = () => {
  const tabs = useGetTasksTabs();
  const [activeTab, setActiveTab] = useState<CrmTaskTabEnum>(tabs[0]?.id);

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden">
      <div className="shrink-0">
        <Tabs
          tabs={tabs}
          activeTabId={activeTab}
          onTabChange={(id) => setActiveTab(id as CrmTaskTabEnum)}
        />
        <hr className="border-secondary-accent" />
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        <TaskTabContent tab={activeTab} />
      </div>
    </div>
  );
};

export default TasksTable;
