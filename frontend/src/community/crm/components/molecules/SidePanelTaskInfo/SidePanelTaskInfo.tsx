import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { CrmTaskDetailType } from "~community/crm/types/CommonTypes";

import TaskClosingDateField from "./TaskClosingDateField";
import TaskContactField from "./TaskContactField";
import TaskOwnerField from "./TaskOwnerField";
import TaskPriorityField from "./TaskPriorityField";

interface Props {
  task: CrmTaskDetailType;
  onMarkAsDone?: () => void;
}

const SidePanelTaskInfo: FC<Props> = ({ task, onMarkAsDone }) => {
  const translateText = useTranslator("crmModule", "tasks", "sidePanel");

  return (
    <>
      <ButtonV2
        type="button"
        variant="primary"
        size="md"
        onClick={onMarkAsDone}
        disabled={task.isCompleted}
        {...(task.isCompleted && {
          icon: (
            <Icon
              name={IconName.TICK_ICON}
              fill="var(--color-secondary-icon)"
              width="16"
              height="16"
            />
          )
        })}
        iconPosition="end"
      >
        {task.isCompleted
          ? translateText(["statusDone"])
          : translateText(["markAsDone"])}
      </ButtonV2>

      <div className="w-[18.4375rem] min-h-[12.5rem] flex flex-col gap-3 border border-secondary-accent rounded-xl p-3 mt-4">
        <TaskOwnerField
          owner={task.owner}
          label={translateText(["assignedTo"])}
        />
        <TaskPriorityField
          priority={task.priority}
          label={translateText(["priority"])}
          translateText={translateText}
        />
        <TaskClosingDateField
          dueAt={task.dueAt}
          label={translateText(["closingDate"])}
          noneText={translateText(["none"])}
        />
        <TaskContactField
          contact={task.contact}
          label={translateText(["contactName"])}
          noneText={translateText(["none"])}
        />
      </div>
    </>
  );
};

export default SidePanelTaskInfo;
