import { Tabs } from "@rootcodelabs/skapp-ui";
import { FC, ReactNode } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import ActivityFilterControl from "~community/crm/activities/components/molecules/ActivityFilterControl/ActivityFilterControl";
import ActivitySearchField from "~community/crm/activities/components/molecules/ActivitySearchField/ActivitySearchField";
import {
  ActivityFeedFilters,
  ActivityTab
} from "~community/crm/activities/types/activityTypes";
import { CrmOwnerEntity } from "~community/crm/types/CrmCommonTypes";

export interface ActivityToolbarProps {
  id?: string;
  activeTab: ActivityTab;
  onTabChange: (tab: ActivityTab) => void;
  searchTerm: string;
  onSearchChange: (searchTerm: string) => void;
  resultCount: number;
  isResultCountReady: boolean;
  isManager: boolean;
  filters: ActivityFeedFilters;
  onApplyFilters: (filters: ActivityFeedFilters) => void;
  teamMembers: CrmOwnerEntity[];
  isTeamMembersError: boolean;
  timeZone?: string;
  showControls?: boolean;
  action?: ReactNode;
}

const ActivityToolbar: FC<ActivityToolbarProps> = ({
  id = "crm-activity-toolbar",
  activeTab,
  onTabChange,
  searchTerm,
  onSearchChange,
  resultCount,
  isResultCountReady,
  isManager,
  filters,
  onApplyFilters,
  teamMembers,
  isTeamMembersError,
  timeZone,
  showControls = true,
  action
}) => {
  const translateText = useTranslator("crmModule");
  const translateAria = useTranslator("crmAria");

  const ACTIVITY_TABS = Object.values(ActivityTab);

  const tabs = ACTIVITY_TABS.map((tab) => ({
    id: tab,
    label: translateText(["activities", "tabs", tab.toLowerCase()])
  }));

  const handleTabChange = (tabId: string): void => {
    const tab = ACTIVITY_TABS.find((item) => item === tabId);

    if (tab) onTabChange(tab);
  };

  return (
    <div id={id} className="flex flex-col gap-4">
      <div className="border-b border-secondary-accent">
        <Tabs
          tabs={tabs}
          activeTabId={activeTab}
          ariaLabel={translateAria(["activities", "tabs"])}
          onTabChange={handleTabChange}
        />
      </div>

      {(showControls || action) && (
        <div className="flex items-center gap-3">
          {showControls && isManager && (
            <ActivityFilterControl
              id={`${id}-filter`}
              filters={filters}
              onApplyFilters={onApplyFilters}
              teamMembers={teamMembers}
              isTeamMembersError={isTeamMembersError}
              timeZone={timeZone}
            />
          )}

          {showControls && (
            <ActivitySearchField
              id={`${id}-search`}
              placeholder={translateText([
                "activities",
                "toolbar",
                "search",
                "placeholders",
                activeTab.toLowerCase()
              ])}
              searchTerm={searchTerm}
              onSearchChange={onSearchChange}
              resultCount={resultCount}
              isResultCountReady={isResultCountReady}
            />
          )}

          {action && <div className="ml-auto shrink-0">{action}</div>}
        </div>
      )}
    </div>
  );
};

export default ActivityToolbar;
