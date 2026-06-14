import { ButtonV2, PlusIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import TaskRow from "~community/crm/components/molecules/AddCompanyModalContent/TaskRow/TaskRow";
import { CrmTaskType } from "~community/crm/types/CommonTypes";

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
      <ButtonV2
        type="button"
        variant="line"
        size="sm"
        icon={<PlusIcon />}
        iconPosition="end"
        className="mt-2"
        onClick={onAddTask}
      >
        {translateText(["addTaskButtonEmptyView"])}
      </ButtonV2>
    </>
  );
};

export default SidePanelTasksList;
