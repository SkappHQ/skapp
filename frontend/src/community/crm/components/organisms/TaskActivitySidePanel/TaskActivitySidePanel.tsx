import { ChecklistVerificationFilledIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import SidePanelActivityTaskInfo from "~community/crm/components/molecules/SidePanelActivityTaskInfo/SidePanelActivityTaskInfo";
import ActivitySidePanel from "~community/crm/components/organisms/ActivitySidePanel/ActivitySidePanel";
import { TASK_DETAIL_ICON_SIZE } from "~community/crm/constants/taskConstants";
import { useCrmStore } from "~community/crm/store/store";
import { CrmActivityTaskEntity } from "~community/crm/types/CrmCommonTypes";

interface Props {
  task?: CrmActivityTaskEntity;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  onContactClick: () => void;
  onCompanyClick: () => void;
}

const TaskActivitySidePanel: FC<Props> = ({
  task,
  isOpen,
  onClose,
  onDelete,
  onContactClick,
  onCompanyClick
}) => {
  const translateText = useTranslator("crmModule", "activities");
  const translateAria = useTranslator("crmAria", "activities", "taskSidePanel");

  const owners = useCrmStore((state) => state.owners);

  return (
    <ActivitySidePanel
      id="activity-task"
      isOpen={isOpen}
      isLoading={!task}
      onClose={onClose}
      icon={
        <ChecklistVerificationFilledIcon
          width={TASK_DETAIL_ICON_SIZE}
          height={TASK_DETAIL_ICON_SIZE}
        />
      }
      menuItems={[]}
      deleteLabel={translateText(["taskSidePanel", "deleteTask"])}
      onDelete={onDelete}
      menuAriaLabel={translateAria(["kebabMenu"])}
      emptyDealsDescription={translateText([
        "taskSidePanel",
        "noDealsDescription"
      ])}
      commentsTitle={translateText(["activitySidePanel", "comments"])}
      emptyCommentsText={translateText(["activitySidePanel", "noComments"])}
      {...(task && {
        title: task.name,
        comments: task.notes,
        deal: task.deal,
        info: (
          <SidePanelActivityTaskInfo
            task={task}
            owner={owners[task.ownerId]}
            onContactClick={onContactClick}
            onCompanyClick={onCompanyClick}
          />
        )
      })}
    />
  );
};

export default TaskActivitySidePanel;
