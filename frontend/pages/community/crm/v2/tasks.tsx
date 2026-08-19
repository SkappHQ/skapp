import { NextPage } from "next";
import { useEffect, useRef } from "react";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { Modules } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import SidePanelWrapper from "~community/crm/components/atoms/SidePanelWrapper/SidePanelWrapper";
import TaskModalController from "~community/crm/v2/components/organisms/TaskModalController/TaskModalController";
import TaskSidePanel from "~community/crm/v2/components/organisms/TaskSidePanel/TaskSidePanel";
import TasksTable from "~community/crm/v2/components/organisms/TasksTable/TasksTable";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmModalTypes } from "~community/crm/v2/types/CrmTypes";
import useCrmLimitGuard from "~enterprise/crm/hooks/useCrmLimitGuard";
import { CrmLimitResource } from "~enterprise/crm/types/CrmLimitTypes";

const Tasks: NextPage = () => {
  const translateText = useTranslator("crmModule");
  const containerRef = useRef<HTMLDivElement>(null);
  const { guardCrmCreate, isCheckingCrmLimit } = useCrmLimitGuard();

  const {
    setIsTaskModalOpen,
    setTaskModalType,
    selectedTaskId,
    setSelectedTaskId
  } = useCrmStoreV2((state) => ({
    setIsTaskModalOpen: state.setIsTaskModalOpen,
    setTaskModalType: state.setTaskModalType,
    selectedTaskId: state.selectedTaskId,
    setSelectedTaskId: state.setSelectedTaskId
  }));

  const onPrimaryButtonClick = () => {
    guardCrmCreate(CrmLimitResource.TASKS, () => {
      setSelectedTaskId(null);
      setIsTaskModalOpen(true);
      setTaskModalType(CrmModalTypes.ADD_TASK_MODAL);
    });
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
      breadcrumbs={[
        { label: translateText(["breadcrumbs", "crm"]) },
        { label: translateText(["tasks", "title"]) }
      ]}
      pageHead={translateText(["tasks", "pageHead"])}
      title={translateText(["tasks", "title"])}
      primaryButtonText={translateText(["tasks", "addTaskBtn"])}
      primaryBtnIconName={IconName.ADD_ICON}
      containerStyles={{
        padding: { xs: "1.375rem 2rem 0", lg: "1.375rem 3rem 0" }
      }}
      onPrimaryButtonClick={onPrimaryButtonClick}
      isPrimaryBtnLoading={isCheckingCrmLimit}
      module={Modules.CRM}
    >
      <>
        {selectedTaskId && (
          <SidePanelWrapper>
            <TaskSidePanel />
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
