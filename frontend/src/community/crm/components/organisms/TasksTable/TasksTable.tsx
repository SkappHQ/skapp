import { Tabs } from "@rootcodelabs/skapp-ui";
import { FC, useMemo, useState } from "react";

import { CrmTaskTabEnum } from "~community/crm/enums/common";
import { useGetTasksTabs } from "~community/crm/hooks/useGetTasksTabs";

import OpenTasksTabContent from "../../molecules/OpenTasksTabContent/OpenTasksTabContent";

const TasksTable: FC = () => {
  const tabs = useGetTasksTabs();
  const [activeTab, setActiveTab] = useState(tabs[0]?.id);

  const tabContent = useMemo(() => {
    switch (activeTab) {
      case CrmTaskTabEnum.MY_TASKS:
        return <OpenTasksTabContent tab={CrmTaskTabEnum.MY_TASKS} />;
      case CrmTaskTabEnum.TEAM_TASKS:
        return <OpenTasksTabContent tab={CrmTaskTabEnum.TEAM_TASKS} />;
      default:
        return <></>;
    }
  }, [activeTab]);

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
      <div className="flex-1 min-h-0 overflow-hidden">{tabContent}</div>
    </div>
  );
};

export default TasksTable;
