import { Button } from "@mui/material";
import { NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { IconName } from "~community/common/types/IconTypes";
import TaskDetailSidePanel from "~community/crm/components/organisms/TaskDetailSidePanel/TaskDetailSidePanel";
import TaskModalController from "~community/crm/components/organisms/TaskModalController/TaskModalController";
import TasksTable from "~community/crm/components/organisms/TasksTable/TasksTable";
import { CrmPriorityEnum } from "~community/crm/enums/common";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

const Tasks: NextPage = () => {
  const translateText = useTranslator("crmModule", "tasks");

  const {
    isCrmSidePanelOpen,
    setIsCrmSidePanelOpen,
    setSelectedTask,
    setIsTaskModalOpen,
    setTaskModalType
  } = useCrmStore((store) => ({
    isCrmSidePanelOpen: store.isCrmSidePanelOpen,
    setIsCrmSidePanelOpen: store.setIsCrmSidePanelOpen,
    setSelectedTask: store.setSelectedTask,
    setIsTaskModalOpen: store.setIsTaskModalOpen,
    setTaskModalType: store.setTaskModalType
  }));

  const onPrimaryButtonClick = () => {
    setIsTaskModalOpen(true);
    setTaskModalType(CrmModalTypes.ADD_TASK_MODAL);
  };

  const handleCloseSidePanel = () => {
    setIsCrmSidePanelOpen(false);
    setSelectedTask(null);
  };

  const handleTestSidePanel = () => {
    setSelectedTask({
      id: 1,
      name: "Follow up call with client",
      type: { id: 1, name: "Call", orderIndex: 0 },
      priority: CrmPriorityEnum.HIGH,
      isCompleted: false,
      dueAt: "2026-06-20T10:00:00",
      notes: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. ",
      owner: {
        employeeId: 1,
        firstName: "John",
        lastName: "Doe",
        authPic: null
      },
      contact: {
        id: 1,
        name: "Jane Smith",
        email: "jane.smith@example.com",
        contactNumber: null,
        lastContactAt: null,
        lastModifiedDate: "2026-06-18T10:00:00",
        company: null,
        owner: { employeeId: 1, firstName: "John", lastName: "Doe", authPic: null },
        isDeleted: false
      },
      company: null,
      deal: {
        id: 1,
        name: "Enterprise License Deal",
        amount: 25000,
        stage: { id: 1, name: "Negotiation", orderIndex: 2 }
      } as any,
      isDeleted: false
    });
    setIsCrmSidePanelOpen(true);
  };

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      primaryButtonText={translateText(["addTaskBtn"])}
      primaryBtnIconName={IconName.ADD_ICON}
      containerStyles={{ zIndex: ZIndexEnums.CRM_CONTENT_LAYOUT }}
      onPrimaryButtonClick={onPrimaryButtonClick}
    >
      <>
        <Button
          variant="contained"
          onClick={handleTestSidePanel}
          sx={{ mb: 2 }}
        >
          Test Side Panel
        </Button>
        <TaskDetailSidePanel isOpen={isCrmSidePanelOpen} onClose={handleCloseSidePanel} />
        <TaskModalController />
        <TasksTable />
      </>
    </ContentLayout>
  );
};

export default Tasks;
