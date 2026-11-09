import {
  ButtonV2,
  ChecklistVerificationFilledIcon,
  UndoIcon
} from "@rootcodelabs/skapp-ui";
import { FC, ReactNode } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { ActivityTaskEditPayload } from "~community/crm/activities/types/activityTypes";
import SidePanelActivityTaskEditForm from "~community/crm/components/molecules/SidePanelActivityTaskEditForm/SidePanelActivityTaskEditForm";
import ActivitySidePanel from "~community/crm/components/organisms/ActivitySidePanel/ActivitySidePanel";
import { TASK_DETAIL_ICON_SIZE } from "~community/crm/constants/taskConstants";
import { CrmActivityTaskEntity } from "~community/crm/types/CrmCommonTypes";

interface Props {
  task?: CrmActivityTaskEntity;
  isOpen: boolean;
  onClose: () => void;
  related: ReactNode;
  onTitleSave: (title: string) => void;
  onCommentsSave: (comments: string) => void;
  onDealChange: (dealId: number | null) => void;
  onDelete: () => void;
  onMarkAsDone: () => void;
  onReopen: () => void;
  onDetailsSave: (payload: ActivityTaskEditPayload) => void;
}

const TaskActivitySidePanel: FC<Props> = ({
  task,
  isOpen,
  onClose,
  related,
  onTitleSave,
  onCommentsSave,
  onDealChange,
  onDelete,
  onMarkAsDone,
  onReopen,
  onDetailsSave
}) => {
  const translateText = useTranslator("crmModule");
  const translateAria = useTranslator("crmAria", "activities", "taskSidePanel");

  const isCompleted = task?.isCompleted === true;

  return (
    <ActivitySidePanel
      id="activity-task"
      isOpen={isOpen}
      isLoading={!task}
      onClose={onClose}
      related={related}
      onTitleSave={onTitleSave}
      onCommentsSave={onCommentsSave}
      onDealChange={onDealChange}
      icon={
        <ChecklistVerificationFilledIcon
          width={TASK_DETAIL_ICON_SIZE}
          height={TASK_DETAIL_ICON_SIZE}
        />
      }
      menuItems={
        isCompleted
          ? [
              {
                id: "undo",
                label: translateText(["activities", "taskSidePanel", "undo"]),
                icon: { start: <UndoIcon width="16px" height="16px" /> },
                onClick: onReopen
              }
            ]
          : []
      }
      deleteLabel={translateText(["activities", "taskSidePanel", "deleteTask"])}
      onDelete={onDelete}
      menuAriaLabel={translateAria(["kebabMenu"])}
      emptyDealsDescription={translateText([
        "activities",
        "taskSidePanel",
        "noDealsDescription"
      ])}
      {...(task && {
        title: task.name,
        comments: task.notes,
        deal: task.deal,
        info: (
          <div className="flex flex-col gap-4">
            <ButtonV2
              type="button"
              variant="primary"
              size="md"
              onClick={onMarkAsDone}
              disabled={isCompleted}
              {...(isCompleted && {
                icon: (
                  <Icon
                    name={IconName.TICK_ICON}
                    fill="var(--color-secondary-icon)"
                    width="16"
                    height="16"
                  />
                )
              })}
            >
              {isCompleted
                ? translateText(["tasks", "sidePanel", "info", "statusDone"])
                : translateText(["tasks", "sidePanel", "info", "markAsDone"])}
            </ButtonV2>
            <SidePanelActivityTaskEditForm
              key={task.id}
              task={task}
              onSave={onDetailsSave}
            />
          </div>
        )
      })}
    />
  );
};

export default TaskActivitySidePanel;
