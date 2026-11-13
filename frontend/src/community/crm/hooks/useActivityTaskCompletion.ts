import { Dispatch, SetStateAction, useState } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { ActivityRow } from "~community/crm/activities/types/activityTypes";
import { useUpdateTaskCompletion } from "~community/crm/api/ActivityApi";
import { CrmTaskCompletionPayload } from "~community/crm/types/CrmCommonTypes";

interface ActivityTaskCompletion {
  taskCompletions: Record<number, boolean>;
  setTaskCompletions: Dispatch<SetStateAction<Record<number, boolean>>>;
  handleToggleComplete: (row: ActivityRow, isCompleted: boolean) => void;
}

export const useActivityTaskCompletion = (): ActivityTaskCompletion => {
  const translateText = useTranslator("crmModule");
  const { setToastMessage } = useToast();

  const [taskCompletions, setTaskCompletions] = useState<
    Record<number, boolean>
  >({});

  const applyCompletion = (taskId: number, isCompleted: boolean): void => {
    setTaskCompletions((current) => ({ ...current, [taskId]: isCompleted }));
  };

  const handleToggleError = ({
    id,
    isCompleted
  }: CrmTaskCompletionPayload): void => {
    applyCompletion(id, !isCompleted);
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText([
        "tasks",
        "common",
        "toastMessages",
        "toggleErrorTitle"
      ]),
      description: translateText([
        "tasks",
        "common",
        "toastMessages",
        "toggleErrorDescription"
      ])
    });
  };

  const { mutate: updateTaskCompletion, isPending } =
    useUpdateTaskCompletion(handleToggleError);

  const handleToggleComplete = (
    row: ActivityRow,
    isCompleted: boolean
  ): void => {
    if (isPending) return;

    applyCompletion(row.id, isCompleted);

    updateTaskCompletion({ id: row.id, isCompleted });
  };

  return { taskCompletions, setTaskCompletions, handleToggleComplete };
};
