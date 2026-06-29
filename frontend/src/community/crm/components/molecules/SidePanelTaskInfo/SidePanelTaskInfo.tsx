import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmTaskDetailType } from "~community/crm/types/CommonTypes";

import TaskClosingDateField from "./TaskClosingDateField";
import TaskContactField from "./TaskContactField";
import TaskOwnerField from "./TaskOwnerField";
import TaskPriorityField from "./TaskPriorityField";

interface Props {
  task: CrmTaskDetailType;
}

const SidePanelTaskInfo: FC<Props> = ({ task }) => {
  const translateText = useTranslator("crmModule", "tasks", "sidePanel");

  return (
    <div className="w-[18.4375rem] min-h-[12.5rem] flex flex-col gap-3 border border-secondary-accent rounded-xl p-3">
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
  );
};

export default SidePanelTaskInfo;
