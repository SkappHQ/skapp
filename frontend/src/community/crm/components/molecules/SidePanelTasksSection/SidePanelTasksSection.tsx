import { ButtonV2, EmptyDataView, PlusIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import SearchIcon from "~community/common/assets/Icons/SearchIcon";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useUpdateTaskCompletion } from "~community/crm/api/TasksApi";
import TaskRow from "~community/crm/components/atoms/TaskRow/TaskRow";
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
    <>
      {!isLoading && hasTasks && (
        <>
          <div className="border border-secondary-accent rounded-[8px] divide-y divide-secondary-accent w-full">
            {tasks.map((task) => (
              <TaskRow
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
          <ButtonV2
            type="button"
            variant="line"
            size="sm"
            icon={<PlusIcon />}
            iconPosition="end"
            className="mt-2"
            onClick={() => {
              // TODO: open add task modal (wire up to CRM store)
            }}
          >
            {translateText(["addTaskButtonEmptyView"])}
          </ButtonV2>
        </>
      )}

      {!isLoading && !hasTasks && (
        <div className="bg-secondary-background flex flex-col  h-[228px] items-center justify-center rounded-[8px] w-full">
          <EmptyDataView
            icon={<SearchIcon width="24" height="24" />}
            title={translateText(["emptyTitle"])}
            description={translateText(["emptyDescription"])}
            className={{
              wrapper: "h-auto",
              title: "leading-[24px] tracking-[-0.4395px] text-black",
              description: "text-black"
            }}
          />
          <ButtonV2
            type="button"
            variant="tertiary"
            size="sm"
            icon={<PlusIcon />}
            iconPosition="end"
            onClick={() => {
              // TODO: open add task modal (wire up to CRM store)
            }}
          >
            {translateText(["addTaskButtonEmptyView"])}
          </ButtonV2>
        </div>
      )}
    </>
  );
};

export default SidePanelTasksSection;
