import { Tabs } from "@rootcodelabs/skapp-ui";
import { NextPage } from "next";
import { useState } from "react";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { getTasksPageTabs } from "~community/crm/constants/crmTaskConstants";

const Tasks: NextPage = () => {
  const translateText = useTranslator("crmModule", "tasks");

  const tabs = getTasksPageTabs(translateText);
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      primaryButtonText={translateText(["addTaskBtn"])}
      primaryBtnIconName={IconName.ADD_ICON}
    >
      <div className="border-b border-secondary-accent">
        <Tabs
          tabs={tabs}
          activeTabId={activeTabId}
          onTabChange={setActiveTabId}
          size="md"
          ariaLabel={translateText(["tabs", "ariaLabel"])}
        />
      </div>
    </ContentLayout>
  );
};

export default Tasks;
