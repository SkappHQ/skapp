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
import {
  useGetTasksByContactId,
  useUpdateTaskCompletion
} from "~community/crm/api/CrmContactsApi";
import SidePanelTaskRow from "~community/crm/components/atoms/SidePanelTaskRow/SidePanelTaskRow";
import { SidePanelTaskListSkeleton } from "~community/crm/components/atoms/SidePanelTaskRow/SidePanelTaskRowSkeleton";
import { CrmTaskType } from "~community/crm/types/CommonTypes";
import { TASK_TYPE_OPTIONS } from "~community/crm/utils/crmTaskUtils";

interface Props {
  contactId: number;
}

const SidePanelTasksSection: FC<Props> = ({ contactId }) => {
  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "contactDetailsPanel",
    "tasks"
  );

  const [isAddingTask, setIsAddingTask] = useState(false);

  const { data: tasksData, isLoading } = useGetTasksByContactId(contactId);
  const tasks: CrmTaskType[] = tasksData ?? [];
  const { mutateAsync: updateCompletion } = useUpdateTaskCompletion(
    () => {},
    () => {}
  );

  const handleToggleComplete = async (
    id: number,
    isCompleted: boolean
  ): Promise<void> => {
    await updateCompletion({ id, isCompleted });
  };

  const hasTasks = tasks.length > 0;

  return (
    <div>
      {isLoading && <SidePanelTaskListSkeleton />}

      {!isLoading && (hasTasks || isAddingTask) && (
        <div className="flex flex-col items-start w-full">
          {hasTasks && (
            <div
              className={
                isAddingTask
                  ? "border border-gray-200 rounded-[8px] rounded-b-none divide-y divide-gray-200 w-full"
                  : "border border-gray-200 rounded-[8px] divide-y divide-gray-200 w-full"
              }
            >
              {tasks.map((task, idx) => (
                <SidePanelTaskRow
                  key={task.id}
                  task={task}
                  onToggleComplete={handleToggleComplete}
                  hasFormBelow={isAddingTask && idx === tasks.length - 1}
                  onRowClick={() => {
                    // TODO: open task detail side panel
                    // (wire up to CRM store once TaskDetailPanel is implemented)
                  }}
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
        <div className="bg-[#f9fafb] flex flex-col gap-[12px] h-[228px] items-center justify-center rounded-[8px] w-full">
          <EmptyDataView
            icon={<SearchIcon width="24" height="24" fill="#71717A" />}
            title={translateText(["emptyTitle"])}
            description={translateText(["emptyDescription"])}
            className={{
              wrapper: "!h-auto !p-0",
              title:
                "!font-bold !text-[18px] !leading-[24px] !tracking-[-0.4395px] !text-black",
              description: "!font-normal !text-[14px] !text-black"
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

export default SidePanelTasksSection;
