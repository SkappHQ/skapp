import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  CompleteActivityTaskRequest,
  useCompleteActivityTask
} from "~community/crm/activities/api/ActivityApi";
import { patchTaskInFeedCache } from "~community/crm/activities/api/utils/activityFeedCache";
import {
  ActivityRow,
  ActivityType
} from "~community/crm/activities/types/activityTypes";

export const ACTIVITY_COMPLETE_DEBOUNCE_DELAY = 400;

interface PendingCompletion {
  confirmed: boolean;
  desired: boolean;
  timer: ReturnType<typeof setTimeout> | null;
  inFlight: boolean;
}

export const useActivityTaskCompletion = (): {
  toggleTaskComplete: (row: ActivityRow, isCompleted: boolean) => void;
} => {
  const queryClient = useQueryClient();
  const translateText = useTranslator("crmModule");
  const { setToastMessage } = useToast();
  const pendingRef = useRef<Map<number, PendingCompletion>>(new Map());

  const completeTaskRef = useRef<
    (request: CompleteActivityTaskRequest) => void
  >(() => {});

  const submit = (taskId: number) => {
    const pending = pendingRef.current.get(taskId);

    if (!pending) return;

    pending.timer = null;

    if (pending.inFlight) return;

    if (pending.desired === pending.confirmed) {
      pendingRef.current.delete(taskId);
      return;
    }

    pending.inFlight = true;
    completeTaskRef.current({ id: taskId, isCompleted: pending.desired });
  };

  const showCompleteError = () =>
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["activities", "toasts", "completeError", "title"]),
      description: translateText([
        "activities",
        "toasts",
        "completeError",
        "description"
      ])
    });

  const handleSuccess = (
    updatedRow: ActivityRow,
    request: CompleteActivityTaskRequest
  ) => {
    const pending = pendingRef.current.get(request.id);
    const serverRow: Partial<ActivityRow> = updatedRow ?? {
      isCompleted: request.isCompleted
    };

    if (!pending) {
      patchTaskInFeedCache(queryClient, request.id, serverRow);
      return;
    }

    pending.inFlight = false;
    pending.confirmed = serverRow.isCompleted ?? request.isCompleted;

    if (pending.timer) return;

    if (pending.desired !== pending.confirmed) {
      submit(request.id);
      return;
    }

    patchTaskInFeedCache(queryClient, request.id, serverRow);
    pendingRef.current.delete(request.id);
  };

  const handleError = (
    _error: unknown,
    request: CompleteActivityTaskRequest
  ) => {
    const pending = pendingRef.current.get(request.id);
    const confirmed = pending ? pending.confirmed : !request.isCompleted;

    if (pending?.timer) clearTimeout(pending.timer);
    pendingRef.current.delete(request.id);

    patchTaskInFeedCache(queryClient, request.id, { isCompleted: confirmed });
    showCompleteError();
  };

  const { mutate: completeTask } = useCompleteActivityTask(
    handleSuccess,
    handleError
  );

  useEffect(() => {
    completeTaskRef.current = completeTask;
  }, [completeTask]);

  useEffect(() => {
    const pendingCompletions = pendingRef.current;

    return () => {
      pendingCompletions.forEach((pending, taskId) => {
        if (!pending.timer) return;

        clearTimeout(pending.timer);
        submit(taskId);
      });
    };
  }, []);

  const toggleTaskComplete = useCallback(
    (row: ActivityRow, isCompleted: boolean) => {
      if (row.type !== ActivityType.TASK || !row.canComplete) return;

      const pending = pendingRef.current.get(row.id) ?? {
        confirmed: row.isCompleted,
        desired: row.isCompleted,
        timer: null,
        inFlight: false
      };

      if (pending.desired === isCompleted && !pending.timer) return;

      pending.desired = isCompleted;
      pendingRef.current.set(row.id, pending);

      patchTaskInFeedCache(queryClient, row.id, {
        isCompleted: pending.desired
      });

      if (pending.timer) clearTimeout(pending.timer);

      pending.timer = setTimeout(
        () => submit(row.id),
        ACTIVITY_COMPLETE_DEBOUNCE_DELAY
      );
    },
    [queryClient]
  );

  return { toggleTaskComplete };
};
