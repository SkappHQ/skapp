import { NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
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
      onPrimaryButtonClick={onPrimaryButtonClick}
    >
      <>
        <TaskModalController />
        <TasksTable />
      </>
    </ContentLayout>
  );
};

export default Tasks;
