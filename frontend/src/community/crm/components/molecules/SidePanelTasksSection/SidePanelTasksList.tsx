import { ButtonV2, PlusIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmTaskType } from "~community/crm/types/CommonTypes";

import TaskRow from "../TaskRow/TaskRow";

interface Props {
  tasks: CrmTaskType[];
  isCheckTaskVisible?: boolean;
  isShowContact?: boolean;
  onTaskRowClick?: () => void;
  onAddTask: () => void;
}

const SidePanelTasksList: FC<Props> = ({
  tasks,
  isCheckTaskVisible,
  isShowContact,
  onTaskRowClick,
  onAddTask
}) => {
  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "contactDetailsPanel",
    "tasks"
  );

  return (
    <>
      <div className="border border-secondary-accent rounded-lg divide-y divide-secondary-accent w-full overflow-hidden">
        {tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            isCheckTaskVisible={isCheckTaskVisible}
            onRowClick={onTaskRowClick}
            isShowContact={isShowContact}
          />
        ))}
      </div>
      <div className=" flex">
        <ButtonV2
          type="button"
          variant="line"
          size="sm"
          icon={<PlusIcon />}
          iconPosition="end"
          onClick={onAddTask}
        >
          {translateText(["addTaskButtonEmptyView"])}
        </ButtonV2>
      </div>
    </>
  );
};

export default SidePanelTasksList;
