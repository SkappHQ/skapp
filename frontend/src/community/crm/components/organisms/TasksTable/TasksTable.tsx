import { Tabs } from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";

import TaskTabContent from "~community/crm/components/molecules/TaskTabContent/TaskTabContent";
import { useGetTasksTabs } from "~community/crm/hooks/useGetTasksTabs";
import { CrmTaskTabEnum } from "~community/crm/v2/enums/common";

const TasksTable: FC = () => {
  const tabs = useGetTasksTabs();
  const [activeTab, setActiveTab] = useState<CrmTaskTabEnum>(tabs[0]?.id);

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
        <TaskTabContent tab={activeTab} />
      </div>
    </div>
  );
};

export default TasksTable;
