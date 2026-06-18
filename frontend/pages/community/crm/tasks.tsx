import { NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { ZIndexEnums } from "~community/common/enums/CommonEnums";

import TaskDetailSidePanel from "~community/crm/components/organisms/TaskDetailSidePanel/TaskDetailSidePanel";
import TasksTable from "~community/crm/components/organisms/TasksTable/TasksTable";
import { useCrmStore } from "~community/crm/store/store";

const Tasks: NextPage = () => {
  const translateText = useTranslator("crmModule", "tasks");

  const {
    isCrmSidePanelOpen,
    setIsCrmSidePanelOpen,
    setSelectedTask
  } = useCrmStore((store) => ({
    isCrmSidePanelOpen: store.isCrmSidePanelOpen,
    setIsCrmSidePanelOpen: store.setIsCrmSidePanelOpen,
    setSelectedTask: store.setSelectedTask
  }));


  const handleCloseSidePanel = () => {
    setIsCrmSidePanelOpen(false);
    setSelectedTask(null);
  };


  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      containerStyles={{ zIndex: ZIndexEnums.CRM_CONTENT_LAYOUT }}
    >
      <>
        <TaskDetailSidePanel isOpen={isCrmSidePanelOpen} onClose={handleCloseSidePanel} />
        <TasksTable />
      </>
    </ContentLayout>
  );
};

export default Tasks;
