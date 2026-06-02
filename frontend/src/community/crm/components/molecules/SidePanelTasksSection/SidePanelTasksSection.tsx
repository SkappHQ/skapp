import { ButtonV2, EmptyDataView, PlusIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import SearchIcon from "~community/common/assets/Icons/SearchIcon";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useUpdateTaskCompletion } from "~community/crm/api/TasksApi";
import SidePanelTaskRow from "~community/crm/components/atoms/SidePanelTaskRow/SidePanelTaskRow";
import { SidePanelTaskListSkeleton } from "~community/crm/components/atoms/SidePanelTaskRow/SidePanelTaskRowSkeleton";
import { CrmTaskType } from "~community/crm/types/CommonTypes";

interface Props {
  tasks: CrmTaskType[];
  isLoading: boolean;
}

const SidePanelTasksSection: FC<Props> = ({ tasks, isLoading }) => {
  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "contactDetailsPanel",
    "tasks"
  );

  const { setToastMessage } = useToast();

  const { mutateAsync: updateCompletion } = useUpdateTaskCompletion(
    () => {},
    () => {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["toggleErrorTitle"]),
        description: translateText(["toggleErrorDescription"])
      });
    }
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

      {!isLoading && hasTasks && (
        <div className="border border-gray-200 rounded-[8px] divide-y divide-gray-200 w-full">
          {tasks.map((task) => (
            <SidePanelTaskRow
              key={task.id}
              task={task}
              onToggleComplete={handleToggleComplete}
              onRowClick={() => {
                // TODO: open task detail side panel
                // (wire up to CRM store once TaskDetailPanel is implemented)
              }}
            />
          ))}
        </div>
      )}

      {!isLoading && hasTasks && (
        <ButtonV2
          type="button"
          variant="line"
          size="sm"
          icon={<PlusIcon />}
          iconPosition="end"
          className="px-1.5! py-1! min-w-0! rounded-lg! text-black! mt-2"
          onClick={() => {
            // TODO: open add task modal (wire up to CRM store)
          }}
        >
          {translateText(["addTaskButtonEmptyView"])}
        </ButtonV2>
      )}

      {!isLoading && !hasTasks && (
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
            onClick={() => {
              // TODO: open add task modal (wire up to CRM store)
            }}
          >
            {translateText(["addTaskButtonEmptyView"])}
          </ButtonV2>
        </div>
      )}
    </div>
  );
};

export default SidePanelTasksSection;
