import { Tabs } from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";

import { TASK_TAB_IDS } from "~community/crm/constants/taskConstants";
import { useGetTasksTabs } from "~community/crm/hooks/useGetTasksTabs";

import OpenTasksTabContent from "../../molecules/OpenTasksTabContent/OpenTasksTabContent";

const TasksTable: FC = () => {
  const tabs = useGetTasksTabs();
  const [activeTab, setActiveTab] = useState(tabs[0]?.id);

  const handleTabChange = (id: string) => {
    setActiveTab(id);
  };

  return (
    <div className="flex flex-col gap-4 h-full overflow-hidden">
      <div className="shrink-0">
        <Tabs
          tabs={tabs}
          activeTabId={activeTab}
          onTabChange={handleTabChange}
        />
        <hr className="border-secondary-accent" />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === TASK_TAB_IDS.MY_TASKS && (
          <OpenTasksTabContent isMyTasks />
        )}
        {activeTab === TASK_TAB_IDS.TEAM_TASKS && <OpenTasksTabContent />}
      </div>
    </div>
  );
};

export default TasksTable;
