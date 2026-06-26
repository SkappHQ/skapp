import { ButtonV2, PlusIcon } from "@rootcodelabs/skapp-ui";
import { FC, RefObject } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { TaskRowResponseType } from "~community/crm/types/CommonTypes";

import TaskRow from "../TaskRow/TaskRow";

interface Props {
  tasks: TaskRowResponseType[];
  isCheckTaskVisible?: boolean;
  isShowContact?: boolean;
  onTaskRowClick?: () => void;
  onAddTask: () => void;
  loadingRef?: RefObject<HTMLDivElement>;
}

const SidePanelTasksList: FC<Props> = ({
  tasks,
  isCheckTaskVisible,
  isShowContact,
  onTaskRowClick,
  onAddTask,
  loadingRef
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
      <div ref={loadingRef} />
    </>
  );
};

export default SidePanelTasksList;
