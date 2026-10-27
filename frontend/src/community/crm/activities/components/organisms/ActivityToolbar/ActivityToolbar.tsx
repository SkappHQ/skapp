import { Tabs } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import ActivityFilterControl from "~community/crm/activities/components/molecules/ActivityFilterControl/ActivityFilterControl";
import ActivitySearchField from "~community/crm/activities/components/molecules/ActivitySearchField/ActivitySearchField";
import {
  ActivityFilterValues,
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
  filters: ActivityFilterValues;
  onApplyFilters: (filters: ActivityFilterValues) => void;
  teamMembers: CrmOwnerEntity[];
  isTeamMembersError: boolean;
  timeZone?: string;
  showControls?: boolean;
}

const ACTIVITY_TOOLBAR_ID = "crm-activity-toolbar";

const ACTIVITY_TABS = Object.values(ActivityTab);

const ActivityToolbar: FC<ActivityToolbarProps> = ({
  id = ACTIVITY_TOOLBAR_ID,
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
  showControls = true
}) => {
  const translateText = useTranslator("crmModule");
  const translateAria = useTranslator("crmAria");

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

      {showControls && (
        <div className="flex items-center gap-3">
          {isManager && (
            <ActivityFilterControl
              id={`${id}-filter`}
              filters={filters}
              onApplyFilters={onApplyFilters}
              teamMembers={teamMembers}
              isTeamMembersError={isTeamMembersError}
              timeZone={timeZone}
            />
          )}

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
        </div>
      )}
    </div>
  );
};

export default ActivityToolbar;
