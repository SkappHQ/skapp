import { NextPage } from "next";
import { useEffect, useRef } from "react";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import SidePanelWrapper from "~community/crm/components/atoms/SidePanelWrapper/SidePanelWrapper";
import ContactSidePanel from "~community/crm/components/organisms/ContactSidePanel/ContactSidePanel";
import TaskDetailSidePanel from "~community/crm/components/organisms/TaskDetailSidePanel/TaskDetailSidePanel";
import TaskModalController from "~community/crm/components/organisms/TaskModalController/TaskModalController";
import TasksTable from "~community/crm/components/organisms/TasksTable/TasksTable";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

const Tasks: NextPage = () => {
  const translateText = useTranslator("crmModule", "tasks");
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    isCrmSidePanelOpen,
    setIsCrmSidePanelOpen,
    selectedTaskId,
    setSelectedTaskId,
    selectedContact,
    setSelectedContact,
    setIsTaskModalOpen,
    setTaskModalType
  } = useCrmStore((store) => ({
    isCrmSidePanelOpen: store.isCrmSidePanelOpen,
    setIsCrmSidePanelOpen: store.setIsCrmSidePanelOpen,
    selectedTaskId: store.selectedTaskId,
    setSelectedTaskId: store.setSelectedTaskId,
    selectedContact: store.selectedContact,
    setSelectedContact: store.setSelectedContact,
    setIsTaskModalOpen: store.setIsTaskModalOpen,
    setTaskModalType: store.setTaskModalType
  }));

  const onPrimaryButtonClick = () => {
    setIsTaskModalOpen(true);
    setTaskModalType(CrmModalTypes.ADD_TASK_MODAL);
  };

  const handleCloseTaskSidePanel = () => {
    setIsCrmSidePanelOpen(false);
    setSelectedTaskId(null);
  };

  const handleCloseContactSidePanel = () => {
    setIsCrmSidePanelOpen(false);
    setSelectedContact(null);
  };

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const offsetTop = containerRef.current.getBoundingClientRect().top;
        containerRef.current.style.height = `calc(100vh - ${offsetTop}px)`;
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      primaryButtonText={translateText(["addTaskBtn"])}
      primaryBtnIconName={IconName.ADD_ICON}
      containerStyles={{
        padding: { xs: "1.375rem 2rem 0", lg: "1.375rem 3rem 0" }
      }}
      onPrimaryButtonClick={onPrimaryButtonClick}
    >
      <>
        {selectedTaskId && !selectedContact && (
          <SidePanelWrapper>
            <TaskDetailSidePanel
              isOpen={isCrmSidePanelOpen}
              onClose={handleCloseTaskSidePanel}
            />
          </SidePanelWrapper>
        )}

        {selectedContact && (
          <SidePanelWrapper>
            <ContactSidePanel
              isOpen={isCrmSidePanelOpen}
              onClose={handleCloseContactSidePanel}
            />
          </SidePanelWrapper>
        )}

        <div ref={containerRef} className="flex flex-col w-full gap-4">
          <TaskModalController />
          <TasksTable />
        </div>
      </>
    </ContentLayout>
  );
};

export default Tasks;
