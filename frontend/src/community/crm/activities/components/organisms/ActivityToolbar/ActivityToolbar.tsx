import { Tabs } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import ActivityFilterControl from "~community/crm/activities/components/molecules/ActivityFilterControl/ActivityFilterControl";
import ActivitySearchField from "~community/crm/activities/components/molecules/ActivitySearchField/ActivitySearchField";
import {
  ActivityFeedFilters,
  ActivityTab,
  ActivityTeamMember
} from "~community/crm/activities/types/activityTypes";

const ACTIVITY_TOOLBAR_ID = "crm-activity-toolbar";

export interface ActivityToolbarProps {
  id?: string;
  activeTab: ActivityTab;
  onTabChange: (tab: ActivityTab) => void;
  searchTerm: string;
  onSearchChange: (searchTerm: string) => void;
  resultCount: number | null;
  isManager: boolean;
  filters: ActivityFeedFilters;
  onApplyFilters: (filters: ActivityFeedFilters) => void;
  teamMembers: ActivityTeamMember[];
  isTeamMembersError: boolean;
  timeZone?: string;
  showControls?: boolean;
}

const ActivityToolbar: FC<ActivityToolbarProps> = ({
  id = ACTIVITY_TOOLBAR_ID,
  activeTab,
  onTabChange,
  searchTerm,
  onSearchChange,
  resultCount,
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

  const tabs = Object.values(ActivityTab).map((tab) => ({
    id: tab,
    label: translateText(["activities", "tabs", tab.toLowerCase()])
  }));

  const searchPlaceholderKey = activeTab.toLowerCase();

  return (
    <div id={id} className="flex flex-col gap-4">
      <div className="border-b border-secondary-accent">
        <Tabs
          tabs={tabs}
          activeTabId={activeTab}
          ariaLabel={translateAria(["activities", "tabs"])}
          onTabChange={(tabId: string) => onTabChange(tabId as ActivityTab)}
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
              searchPlaceholderKey
            ])}
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            resultCount={resultCount}
          />
        </div>
      )}
    </div>
  );
};

export default ActivityToolbar;
