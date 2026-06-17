import { NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import TaskModalController from "~community/crm/components/organisms/TaskModalController/TaskModalController";
import TasksTable from "~community/crm/components/organisms/TasksTable/TasksTable";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

const Tasks: NextPage = () => {
  const translateText = useTranslator("crmModule", "tasks");

  const { setIsTaskModalOpen, setTaskModalType } = useCrmStore((store) => ({
    setIsTaskModalOpen: store.setIsTaskModalOpen,
    setTaskModalType: store.setTaskModalType
  }));

  const onPrimaryButtonClick = () => {
    setIsTaskModalOpen(true);
    setTaskModalType(CrmModalTypes.ADD_TASK_MODAL);
  };

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      primaryButtonText={translateText(["addTaskBtn"])}
      primaryBtnIconName={IconName.ADD_ICON}
      containerStyles={{
        zIndex: ZIndexEnums.CRM_CONTENT_LAYOUT,
        padding: { xs: "1.375rem 2rem 0", lg: "1.375rem 3rem 0" }
      }}
      onPrimaryButtonClick={onPrimaryButtonClick}
    >
      <div className="flex flex-col h-[calc(100vh-10.1rem)] w-full gap-4">
        <TaskModalController />
        <TasksTable />
      </div>
    </ContentLayout>
  );
};

export default Tasks;
