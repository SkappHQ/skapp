import { NextPage } from "next";
import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { Modules } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import TaskTabSkeleton from "~community/crm/v2/components/molecules/TaskTabContent/TaskTabSkeleton";
import TaskModalControllerV2 from "~community/crm/v2/components/organisms/TaskModalController/TaskModalController";
import TaskSidePanelV2 from "~community/crm/v2/components/organisms/TaskSidePanelV2/TaskSidePanelV2";
import TasksTableV2 from "~community/crm/v2/components/organisms/TasksTableV2/TasksTableV2";
import SidePanelWrapperV2 from "~community/crm/v2/components/templates/SidePanelWrapper/SidePanelWrapper";
import { TASK_SKELETON_CONFIG } from "~community/crm/v2/constants/taskConstants";
import { useInitializeCrmData } from "~community/crm/v2/hooks/useInitializeCrmData";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmModalTypes as CrmModalTypesV2 } from "~community/crm/v2/types/CrmTypes";
import useCrmLimitGuard from "~enterprise/crm/hooks/useCrmLimitGuard";
import { CrmLimitResource } from "~enterprise/crm/types/CrmLimitTypes";

const useFullHeightContainer = () => {
  const containerRef = useRef<HTMLDivElement>(null);

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

  return containerRef;
};

const Tasks: NextPage = () => {
  const translateText = useTranslator("crmModule");
  const containerRef = useFullHeightContainer();

  const { guardCrmCreate, isCheckingCrmLimit } = useCrmLimitGuard();

  const {
    selectedTaskId,
    isCrmSidePanelOpen,
    setSelectedTaskId,
    setIsTaskModalOpen,
    setTaskModalType
  } = useCrmStoreV2(
    useShallow((store) => ({
      selectedTaskId: store.selectedTaskId,
      isCrmSidePanelOpen: store.isCrmSidePanelOpen,
      setSelectedTaskId: store.setSelectedTaskId,
      setIsTaskModalOpen: store.setIsTaskModalOpen,
      setTaskModalType: store.setTaskModalType
    }))
  );

  const { isCrmInitialDataLoading } = useInitializeCrmData();

  const onPrimaryButtonClick = () => {
    guardCrmCreate(CrmLimitResource.TASKS, () => {
      setSelectedTaskId(null);
      setTaskModalType(CrmModalTypesV2.ADD_TASK_MODAL);
      setIsTaskModalOpen(true);
    });
  };

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
      onPrimaryButtonClick={onPrimaryButtonClick}
      isPrimaryBtnLoading={isCheckingCrmLimit || isCrmInitialDataLoading}
      containerStyles={{
        padding: { xs: "1.375rem 2rem 0", lg: "1.375rem 3rem 0" }
      }}
      module={Modules.CRM}
    >
      <>
        {selectedTaskId !== null && (
          <SidePanelWrapperV2 isOpen={isCrmSidePanelOpen}>
            <TaskSidePanelV2 taskId={selectedTaskId} />
          </SidePanelWrapperV2>
        )}
        <div ref={containerRef} className="flex flex-col w-full gap-4">
          <TaskModalControllerV2 />
          {isCrmInitialDataLoading ? (
            <TaskTabSkeleton {...TASK_SKELETON_CONFIG.OPEN} />
          ) : (
            <TasksTableV2 />
          )}
        </div>
      </>
    </ContentLayout>
  );
};

export default Tasks;
