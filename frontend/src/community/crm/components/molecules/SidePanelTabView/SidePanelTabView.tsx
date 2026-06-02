import { Tabs } from "@rootcodelabs/skapp-ui";
import { FC, ReactNode, useState } from "react";

export interface SidePanelTab {
  id: string;
  label: string;
  content: ReactNode;
}

interface Props {
  tabs: SidePanelTab[];
  defaultTabId?: string;
}

// TODO: Wire up SidePanelTabView inside ContactDetailPanel (and CompanyDetailPanel)
const SidePanelTabView: FC<Props> = ({ tabs, defaultTabId }) => {
  const [activeTabId, setActiveTabId] = useState<string>(
    defaultTabId ?? tabs[0]?.id ?? ""
  );

  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <div className="flex flex-col">
      <div className="border-b border-secondary-accent">
        <Tabs
          tabs={tabs.map((t) => ({ id: t.id, label: t.label }))}
          activeTabId={activeTabId}
          onTabChange={setActiveTabId}
          size="md"
          className="w-fit "
          ariaLabel="Side panel navigation tabs"
        />
      </div>
      <div className="pt-4">{activeTab?.content}</div>
    </div>
  );
};

export default SidePanelTabView;
