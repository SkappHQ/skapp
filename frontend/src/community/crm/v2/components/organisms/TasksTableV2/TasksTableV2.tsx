import { Tabs } from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";

import TaskTabContent from "~community/crm/v2/components/molecules/TaskTabContent/TaskTabContent";
import { CrmTaskTabEnum } from "~community/crm/v2/enums/common";
import { useGetTasksTabs } from "~community/crm/v2/hooks/useGetTasksTabs";
import { isCrmTaskTab } from "~community/crm/v2/utils/taskUtil";

const TasksTableV2: FC = () => {
  const tabs = useGetTasksTabs();
  const [activeTab, setActiveTab] = useState<CrmTaskTabEnum>(tabs[0]?.id);

  return (
    <div className="flex flex-col gap-4 h-full overflow-hidden">
      <div className="shrink-0">
        <Tabs
          tabs={tabs}
          activeTabId={activeTab}
          onTabChange={(id) => {
            if (isCrmTaskTab(id)) setActiveTab(id);
          }}
        />
        <hr className="border-secondary-accent" />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <TaskTabContent tab={activeTab} />
      </div>
    </div>
  );
};

export default TasksTableV2;
