import {
  SidePanel,
  SidePanelProps
} from "@rootcodelabs/skapp-ui";
import { FC, useEffect } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  useGetRelatedTasks,
  useGetTaskById,
  useUpdateTaskCompletion
} from "~community/crm/api/TaskApi";
import SidePanelTasksSection from "~community/crm/components/molecules/SidePanelTasksSection/SidePanelTasksSection";
import SidePanelDealSection from "~community/crm/components/molecules/SidePanelDealSection/SidePanelDealSection";
import SidePanelTaskInfo from "~community/crm/components/molecules/SidePanelTaskInfo/SidePanelTaskInfo";
import SidePanelTaskNotes from "~community/crm/components/organisms/TaskDetailSidePanel/TaskDetailSidePanelNotes/TaskDetailSidePanelNotes";
import { useCrmStore } from "~community/crm/store/store";
import {
  DetailPanelDealResponseType
} from "~community/crm/types/CommonTypes";
import { getTaskTypeIcon } from "~community/crm/utils/taskUtil";

const TaskDetailSidePanel: FC<SidePanelProps> = ({ isOpen, onClose }) => {
  const translateText = useTranslator("crmModule", "tasks", "sidePanel");
  const { setToastMessage } = useToast();

  const {
    selectedTaskId,
    setSelectedTaskId,
    setIsCrmSidePanelOpen
  } = useCrmStore((store) => ({
    selectedTaskId: store.selectedTaskId,
    setSelectedTaskId: store.setSelectedTaskId,
    setIsCrmSidePanelOpen: store.setIsCrmSidePanelOpen
  }));

  const handleClose = (): void => {
    setSelectedTaskId(null);
    setIsCrmSidePanelOpen(false);
    if (onClose) onClose();
  };

  const {
    data: task,
    isError: isTaskLoadError
  } = useGetTaskById(selectedTaskId ?? 0, isOpen && !!selectedTaskId);

  const contactId = task?.contact?.id ?? task?.contactId ?? null;
  const dealId = task?.deal?.id ?? null;

  const { data: relatedTasks = [] } = useGetRelatedTasks(
    contactId,
    dealId,
    task?.id,
    isOpen && !!task
  );

  const { mutate: updateCompletion } = useUpdateTaskCompletion(
    () => {
      setToastMessage({
        open: true,
        toastType: ToastType.SUCCESS,
        title: translateText(["taskMarkAsDoneSuccessTitle"]),
        description: translateText(["taskMarkAsDoneSuccessDescription"])
      });
    },
    () => {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["taskMarkAsDoneErrorTitle"]),
        description: translateText(["taskMarkAsDoneErrorDescription"])
      });
    }
  );

  useEffect(() => {
    if (!isTaskLoadError) return;

    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["taskLoadErrorTitle"]),
      description: translateText(["taskLoadErrorDescription"])
    });
    handleClose();
  }, [isTaskLoadError]);

  const handleMarkAsDone = () => {
    if (!task || task.isCompleted) return;
    updateCompletion({ id: task.id, isCompleted: true });
  };

const taskIcon = task?.typeName ? getTaskTypeIcon(task.typeName, "24") : null;
  const taskDeals: DetailPanelDealResponseType[] = task?.deal
    ? [task.deal]
    : [];

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={handleClose}
      width="lg"
      animation="slide"
      closeOnBackdropClick
      header={
        <div className="flex items-center gap-4 pl-2">
          {taskIcon}
          <span className="h1 text-black">{task?.name}</span>
        </div>
      }
    >
      {task && (
        <div className="flex gap-6 pb-4">
          <div className="flex flex-col flex-1 gap-6 min-w-0">
            <SidePanelTaskNotes notes={task.notes} />

            <div className="flex flex-col gap-3">
              <h2 className="h2">{translateText(["dealsTitle"])}</h2>
              <hr className="border-secondary-accent" />
              <SidePanelDealSection
                deals={taskDeals}
                showEmptyStateAddDeal={false}
              />
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="h2">{translateText(["relatedTasksTitle"])}</h2>
              <hr className="border-secondary-accent" />
              <SidePanelTasksSection tasks={relatedTasks} />
            </div>
          </div>

          <div className="w-[295px] shrink-0">
            <SidePanelTaskInfo
              task={task}
              onMarkAsDone={handleMarkAsDone}
            />
          </div>
        </div>
      )}
    </SidePanel>
  );
};

export default TaskDetailSidePanel;
