import { NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { Modules } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import ActivityFeed from "~community/crm/activities/components/organisms/ActivityFeed/ActivityFeed";
import ActivityTaskSidePanel from "~community/crm/activities/components/organisms/ActivityTaskSidePanel/ActivityTaskSidePanel";
import ActivityToolbar from "~community/crm/activities/components/organisms/ActivityToolbar/ActivityToolbar";
import { useActivityFeed } from "~community/crm/activities/hooks/useActivityFeed";
import { useActivityTaskPanel } from "~community/crm/activities/hooks/useActivityTaskPanel";
import SidePanelWrapper from "~community/crm/components/templates/SidePanelWrapper/SidePanelWrapper";
import { useInitializeCrmData } from "~community/crm/hooks/useInitializeCrmData";

const Activities: NextPage = () => {
  const translateText = useTranslator("crmModule");

  useInitializeCrmData();

  const {
    isManager,
    timeZone,
    activeTab,
    search,
    appliedFilters,
    setActiveTab,
    setSearch,
    applyFilters,
    pages,
    resultCount,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    loadMore,
    teamMembers,
    isTeamMembersError,
    onRowClick,
    onToggleComplete
  } = useActivityFeed();

  const taskPanel = useActivityTaskPanel();

  return (
    <ContentLayout
      breadcrumbs={[
        { label: translateText(["breadcrumbs", "crm"]) },
        { label: translateText(["breadcrumbs", "activities"]) }
      ]}
      pageHead={translateText(["activities", "page", "pageHead"])}
      title={translateText(["activities", "page", "title"])}
      containerStyles={{
        padding: { xs: "1.375rem 2rem 0", lg: "1.375rem 3rem 0" }
      }}
      module={Modules.CRM}
    >
      <>
        {taskPanel.isOpen && (
          <SidePanelWrapper isOpen={taskPanel.isOpen}>
            <ActivityTaskSidePanel
              isOpen={taskPanel.isOpen}
              task={taskPanel.task}
              isLoading={taskPanel.isLoading}
              isError={taskPanel.isError}
              isEditable={taskPanel.isEditable}
              timeZone={timeZone}
              onClose={taskPanel.onClose}
              onUpdate={taskPanel.onUpdate}
              onToggleComplete={taskPanel.onToggleComplete}
            />
          </SidePanelWrapper>
        )}
        <div className="flex flex-col w-full gap-4">
          <ActivityToolbar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            searchTerm={search}
            onSearchChange={setSearch}
            resultCount={resultCount}
            isManager={isManager}
            filters={appliedFilters}
            onApplyFilters={applyFilters}
            teamMembers={teamMembers}
            isTeamMembersError={isTeamMembersError}
            timeZone={timeZone}
          />
          <ActivityFeed
            activeTab={activeTab}
            pages={pages}
            searchTerm={search}
            isLoading={isLoading}
            isError={isError}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            timeZone={timeZone}
            onLoadMore={loadMore}
            onRowClick={onRowClick}
            onToggleComplete={onToggleComplete}
          />
        </div>
      </>
    </ContentLayout>
  );
};

export default Activities;
