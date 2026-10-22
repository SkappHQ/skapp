import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  CompleteActivityTaskRequest,
  useCompleteActivityTask,
  useGetActivityTaskDetail,
  useUpdateActivityTask
} from "~community/crm/activities/api/ActivityTaskApi";
import {
  keepMonthStable,
  patchTaskInFeedCache
} from "~community/crm/activities/api/utils/activityFeedCache";
import { useActivityStore } from "~community/crm/activities/store/activityStore";
import {
  ActivityRow,
  ActivityTaskDetail,
  ActivityTaskUpdate,
  ActivityType
} from "~community/crm/activities/types/activityTypes";

export interface UseActivityTaskPanelResult {
  isOpen: boolean;
  task: ActivityTaskDetail | null;
  isLoading: boolean;
  isError: boolean;
  isEditable: boolean;
  onClose: () => void;
  onUpdate: (fields: ActivityTaskUpdate) => void;
  onToggleComplete: (isCompleted: boolean) => void;
}

export const useActivityTaskPanel = (): UseActivityTaskPanelResult => {
  const queryClient = useQueryClient();
  const translateText = useTranslator("crmModule");
  const { setToastMessage } = useToast();

  const { selectedActivity, setSelectedActivity } = useActivityStore(
    useShallow((store) => ({
      selectedActivity: store.selectedActivity,
      setSelectedActivity: store.setSelectedActivity
    }))
  );

  const taskId =
    selectedActivity?.type === ActivityType.TASK ? selectedActivity.id : null;

  const { data: task, isLoading, isError } = useGetActivityTaskDetail(taskId);

  const onClose = useCallback(
    () => setSelectedActivity(null),
    [setSelectedActivity]
  );

  const showToast = (
    toastType: ToastType,
    toastKey: "updateError" | "completeError" | "reopenSuccess"
  ) =>
    setToastMessage({
      open: true,
      toastType,
      title: translateText(["activities", "toasts", toastKey, "title"]),
      description: translateText([
        "activities",
        "toasts",
        toastKey,
        "description"
      ])
    });

  const { mutate: updateTask } = useUpdateActivityTask(
    () => {},
    () => showToast(ToastType.ERROR, "updateError")
  );

  const handleCompleteSuccess = (
    updatedRow: ActivityRow,
    request: CompleteActivityTaskRequest
  ) => {
    patchTaskInFeedCache(
      queryClient,
      request.id,
      keepMonthStable(updatedRow ?? { isCompleted: request.isCompleted })
    );

    if (request.isCompleted) {
      onClose();
      return;
    }

    showToast(ToastType.SUCCESS, "reopenSuccess");
  };

  const { mutate: completeTask } = useCompleteActivityTask(
    handleCompleteSuccess,
    () => showToast(ToastType.ERROR, "completeError")
  );

  const onUpdate = (fields: ActivityTaskUpdate) => {
    if (taskId === null) return;

    updateTask({ id: taskId, fields });
  };

  const onToggleComplete = (isCompleted: boolean) => {
    if (taskId === null || !task?.canComplete) return;

    completeTask({ id: taskId, isCompleted });
  };

  return {
    isOpen: taskId !== null,
    task: task ?? null,
    isLoading,
    isError,
    isEditable: task?.canComplete ?? false,
    onClose,
    onUpdate,
    onToggleComplete
  };
};
