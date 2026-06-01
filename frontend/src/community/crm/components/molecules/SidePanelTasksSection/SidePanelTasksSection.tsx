import {
  ButtonV2,
  EmptyDataView,
  ItemAddForm,
  PlusIcon,
  TransparentEnterIcon
} from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";

import SearchIcon from "~community/common/assets/Icons/SearchIcon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import SidePanelTaskRow from "~community/crm/components/atoms/SidePanelTaskRow/SidePanelTaskRow";
import { SidePanelTaskListSkeleton } from "~community/crm/components/atoms/SidePanelTaskRow/SidePanelTaskRowSkeleton";
import { ContactTask } from "~community/crm/types/CommonTypes";
import { TASK_TYPE_OPTIONS } from "~community/crm/utils/crmTaskUtils";

import styles from "./styles";

interface Props {
  tasks: ContactTask[];
  isLoading: boolean;
  onToggleComplete: (id: number, isCompleted: boolean) => void;
}

const TasksSection: FC<Props> = ({ tasks, isLoading, onToggleComplete }) => {
  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "contactDetailsPanel",
    "tasks"
  );

  const [isAddingTask, setIsAddingTask] = useState(false);

  const hasTasks = tasks.length > 0;

  return (
    <div>
      {/* Loading skeletons */}
      {isLoading && <SidePanelTaskListSkeleton />}

      {/* Task list */}
      {!isLoading && (hasTasks || isAddingTask) && (
        <div className={styles.taskSection}>
          {hasTasks && (
            <div
              className={`${styles.taskList}${
                isAddingTask ? " rounded-b-none" : ""
              }`}
            >
              {tasks.map((task, idx) => (
                <SidePanelTaskRow
                  key={task.id}
                  task={task}
                  onToggleComplete={onToggleComplete}
                  isLastBeforeForm={isAddingTask && idx === tasks.length - 1}
                />
              ))}
            </div>
          )}

          {isAddingTask && (
            <ItemAddForm
              itemTypeOptions={TASK_TYPE_OPTIONS}
              defaultSelectedItemType={TASK_TYPE_OPTIONS[0]?.value}
              onSave={(_value: string, _itemType?: string) => {
                // TODO: wire up create-task mutation
                setIsAddingTask(false);
              }}
              onCancel={() => setIsAddingTask(false)}
              inputFieldPlaceholder={translateText(["addTaskPlaceholder"])}
              actionButton={{
                variant: "outlined",
                icon: <TransparentEnterIcon />
              }}
              className={
                hasTasks
                  ? "border-gray-200! border-t-0 rounded-b-lg w-full"
                  : "border-gray-200! rounded-lg w-full"
              }
            />
          )}
        </div>
      )}

      {!isLoading && !isAddingTask && hasTasks && (
        <ButtonV2
          type="button"
          variant="line"
          size="sm"
          icon={<PlusIcon />}
          iconPosition="end"
          className="px-1.5! py-1! min-w-0! rounded-lg! text-black! mt-2"
          onClick={() => setIsAddingTask(true)}
        >
          {translateText(["addTaskButtonEmptyView"])}
        </ButtonV2>
      )}

      {!isLoading && !hasTasks && !isAddingTask && (
        <div className={styles.emptyWrapper}>
          <EmptyDataView
            icon={<SearchIcon width="24" height="24" fill="#71717A" />}
            title={translateText(["emptyTitle"])}
            description={translateText(["emptyDescription"])}
            className={{
              wrapper: styles.emptyDataViewWrapper,
              title: styles.emptyTitle,
              description: styles.emptyDesc
            }}
          />
          <ButtonV2
            type="button"
            variant="tertiary"
            size="sm"
            icon={<PlusIcon />}
            iconPosition="end"
            className="!text-black !min-w-0 !outline-gray-200"
            onClick={() => setIsAddingTask(true)}
          >
            {translateText(["addTaskButtonEmptyView"])}
          </ButtonV2>
        </div>
      )}
    </div>
  );
};

export default TasksSection;
