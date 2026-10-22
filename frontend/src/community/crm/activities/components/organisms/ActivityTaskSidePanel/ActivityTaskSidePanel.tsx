import {
  DeleteButtonIcon,
  KebabMenu,
  MenuItemProps,
  SidePanel,
  UndoIcon
} from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import ActivityTypeIcon from "~community/crm/activities/components/atoms/ActivityTypeIcon/ActivityTypeIcon";
import ActivityTaskDealSection from "~community/crm/activities/components/molecules/ActivityTaskDealSection/ActivityTaskDealSection";
import ActivityTaskInfo from "~community/crm/activities/components/molecules/ActivityTaskInfo/ActivityTaskInfo";
import ActivityTaskNotesField from "~community/crm/activities/components/molecules/ActivityTaskNotesField/ActivityTaskNotesField";
import ActivityTaskTitleField from "~community/crm/activities/components/molecules/ActivityTaskTitleField/ActivityTaskTitleField";
import {
  ACTIVITY_TASK_DETAIL_ICON_SIZE,
  ACTIVITY_TASK_PANEL_ID
} from "~community/crm/activities/constants/activityConstants";
import {
  ActivityTaskDetail,
  ActivityTaskUpdate,
  ActivityType
} from "~community/crm/activities/types/activityTypes";
import { canReopenTask } from "~community/crm/activities/utils/activityTaskUtil";
import SidePanelHeaderActionsSkeleton from "~community/crm/components/molecules/SidePanelSkeleton/SidePanelHeaderActionsSkeleton";
import SidePanelHeaderSkeleton from "~community/crm/components/molecules/SidePanelSkeleton/SidePanelHeaderSkeleton";

import ActivityTaskSidePanelSkeleton from "./ActivityTaskSidePanelSkeleton";

export interface ActivityTaskSidePanelProps {
  id?: string;
  isOpen: boolean;
  task: ActivityTaskDetail | null;
  isLoading: boolean;
  isError: boolean;
  isEditable: boolean;
  timeZone?: string;
  onClose: () => void;
  onUpdate: (fields: ActivityTaskUpdate) => void;
  onToggleComplete: (isCompleted: boolean) => void;
  onDelete?: () => void;
}

const ActivityTaskSidePanel: FC<ActivityTaskSidePanelProps> = ({
  id = ACTIVITY_TASK_PANEL_ID,
  isOpen,
  task,
  isLoading,
  isError,
  isEditable,
  timeZone,
  onClose,
  onUpdate,
  onToggleComplete,
  onDelete
}) => {
  const translateText = useTranslator("crmModule");
  const translateAria = useTranslator("crmAria");

  const titleId = `${id}-title`;
  const isContentReady = !isLoading && !isError && task !== null;

  const menuItems: MenuItemProps[] = [];

  if (task && canReopenTask(task)) {
    menuItems.push({
      id: `${id}-reopen`,
      label: translateText(["activities", "taskPanel", "reopenTask"]),
      icon: { start: <UndoIcon width="16px" height="16px" /> },
      onClick: () => onToggleComplete(false)
    });
  }

  if (onDelete) {
    menuItems.push({
      id: `${id}-delete`,
      label: translateText(["activities", "taskPanel", "deleteTask"]),
      icon: {
        start: (
          <DeleteButtonIcon
            width="12px"
            height="14px"
            fill="var(--color-semantic-red-text)"
          />
        )
      },
      activeBehavior: "hover:bg-semantic-red-background text-semantic-red-text",
      onClick: onDelete
    });
  }

  const renderHeader = () => {
    if (isLoading) return <SidePanelHeaderSkeleton isShowLastUpdate={false} />;

    if (!task) return null;

    return (
      <div className="flex items-center gap-4 pl-2 min-w-0">
        <ActivityTypeIcon
          id={`${id}-type`}
          type={ActivityType.TASK}
          size={ACTIVITY_TASK_DETAIL_ICON_SIZE}
        />
        <ActivityTaskTitleField
          id={titleId}
          name={task.name}
          isCompleted={task.isCompleted}
          isEditable={isEditable}
          onSave={(name) => onUpdate({ name })}
        />
      </div>
    );
  };

  const renderHeaderActions = () => {
    if (isLoading) return <SidePanelHeaderActionsSkeleton />;

    if (!isContentReady || menuItems.length === 0) return null;

    return (
      <KebabMenu
        id={`${id}-actions`}
        menuItems={menuItems}
        anchorButton={{
          "aria-label": translateAria(["activities", "taskPanel", "kebabMenu"])
        }}
        className={{
          anchorElement:
            "hover:bg-secondary-accent bg-tertiary-background w-9 h-9"
        }}
      />
    );
  };

  const renderBody = () => {
    if (isLoading) return <ActivityTaskSidePanelSkeleton />;

    if (isError || !task) {
      return (
        <div
          id={`${id}-error`}
          role="alert"
          className="flex items-center justify-center p-6 rounded-lg bg-secondary-background body2 text-center"
        >
          {translateText(["activities", "taskPanel", "loadError"])}
        </div>
      );
    }

    return (
      <div className="flex gap-6 pb-4">
        <div className="flex flex-col flex-1 gap-6 min-w-0">
          <ActivityTaskNotesField
            id={`${id}-notes`}
            notes={task.notes ?? ""}
            isEditable={isEditable}
            onSave={(notes) => onUpdate({ notes })}
          />

          <ActivityTaskDealSection id={`${id}-deal`} deal={task.deal} />
        </div>

        <div className="w-[18.438rem] shrink-0">
          <ActivityTaskInfo
            id={`${id}-info`}
            task={task}
            isEditable={isEditable}
            timeZone={timeZone}
            onUpdate={onUpdate}
            onMarkAsDone={() => onToggleComplete(true)}
          />
        </div>
      </div>
    );
  };

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      closeOnBackdropClick
      {...(isContentReady ? { ariaLabelledBy: titleId } : {})}
      closeAriaLabel={translateAria(["activities", "taskPanel", "closePanel"])}
      header={renderHeader()}
      headerActions={renderHeaderActions()}
    >
      {renderBody()}
    </SidePanel>
  );
};

export default ActivityTaskSidePanel;
