import { AxiosResponse } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";

import useSessionData from "~community/common/hooks/useSessionData";
import {
  useGetTodaysBirthdayNotifications,
  useGetUserPersonalDetails,
  useMarkBirthdayNotificationsViewedToday
} from "~community/people/api/PeopleApi";
import { useBirthdayNotificationContext } from "~community/people/providers/BirthdayNotificationProvider";
import {
  BirthdayNotificationPayloadType,
  BirthdayNotificationsType,
  BirthdayQueueEntryType,
  MarkBirthdayNotificationsViewedResponse
} from "~community/people/types/BirthdayNotificationTypes";
import {
  clearDismissedCache,
  getDismissedEmployeeIds,
  readDismissedCache,
  writeDismissedCache
} from "~community/people/utils/birthdayNotificationCacheUtils";
import {
  buildBirthdayQueue,
  normalizeEmployeeId
} from "~community/people/utils/birthdayNotificationUtils";

const useBirthdayNotifications = (): BirthdayNotificationsType => {
  const { userId, employeeDetails } = useSessionData();
  const {
    isEligible,
    today,
    evaluationTick,
    isViewedToday,
    cacheLastViewedDate
  } = useBirthdayNotificationContext();

  const { data: currentEmployee, isPending: isCurrentEmployeePending } =
    useGetUserPersonalDetails();

  const currentEmployeeId =
    employeeDetails?.employeeId ??
    normalizeEmployeeId(currentEmployee?.employeeId);

  const isCurrentEmployeeResolved =
    currentEmployeeId !== undefined || !isCurrentEmployeePending;

  const [queue, setQueue] = useState<BirthdayQueueEntryType[]>([]);
  const [cursor, setCursor] = useState(0);

  const seededDataRef = useRef<BirthdayNotificationPayloadType | null>(null);
  const isShowingRef = useRef(false);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const shouldEvaluate = isEligible && !isViewedToday;

  const handleMarkViewedSuccess = (
    response: AxiosResponse<MarkBirthdayNotificationsViewedResponse>
  ) => {
    const lastViewedDate = response.data.results[0]?.lastViewedDate;
    if (lastViewedDate) cacheLastViewedDate(lastViewedDate);
  };

  const { mutate: markViewed } = useMarkBirthdayNotificationsViewedToday(
    handleMarkViewedSuccess
  );

  const { data, refetch } = useGetTodaysBirthdayNotifications(shouldEvaluate);

  useEffect(() => {
    if (!data) return;
    if (seededDataRef.current === data) return;
    if (!shouldEvaluate) return;
    if (isShowingRef.current) return;
    if (!isCurrentEmployeeResolved) return;
    if (userId === undefined) return;

    seededDataRef.current = data;

    if (data.lastViewedDate) {
      cacheLastViewedDate(data.lastViewedDate);
    }

    const birthdayQueue = buildBirthdayQueue(
      data.employeeBirthdays,
      currentEmployeeId
    );

    const dismissedEmployeeIds = getDismissedEmployeeIds(
      readDismissedCache(),
      today,
      userId
    );
    const pendingQueue = birthdayQueue.filter(
      (entry) => !dismissedEmployeeIds.includes(entry.employee.employeeId)
    );

    if (pendingQueue.length === 0) {
      if (data.lastViewedDate !== today) {
        markViewed();
      }
      return;
    }

    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    isShowingRef.current = true;
    setQueue(pendingQueue);
    setCursor(0);
  }, [
    data,
    shouldEvaluate,
    today,
    userId,
    currentEmployeeId,
    isCurrentEmployeeResolved,
    markViewed,
    cacheLastViewedDate
  ]);

  const finishSequence = useCallback(() => {
    isShowingRef.current = false;
    setQueue([]);
    setCursor(0);
    markViewed();

    requestAnimationFrame(() => {
      const elementToRestore = restoreFocusRef.current;
      if (elementToRestore && document.contains(elementToRestore)) {
        elementToRestore.focus?.();
      }
      restoreFocusRef.current = null;
    });
  }, [markViewed]);

  const onDismiss = useCallback(() => {
    const dismissedEntry = queue[cursor];

    if (dismissedEntry && userId !== undefined && today) {
      const existingDismissedIds = getDismissedEmployeeIds(
        readDismissedCache(),
        today,
        userId
      );
      const dismissedEmployeeId = dismissedEntry.employee.employeeId;

      if (!existingDismissedIds.includes(dismissedEmployeeId)) {
        writeDismissedCache({
          userId,
          date: today,
          dismissedEmployeeIds: [...existingDismissedIds, dismissedEmployeeId]
        });
      }
    }

    const nextCursor = cursor + 1;

    if (nextCursor < queue.length) {
      setCursor(nextCursor);
      return;
    }

    finishSequence();
  }, [cursor, queue, userId, today, finishSequence]);

  useEffect(() => {
    if (evaluationTick === 0) return;
    if (!shouldEvaluate) return;
    if (isShowingRef.current) return;
    if (!navigator.onLine) return;

    refetch({ cancelRefetch: false });
  }, [evaluationTick, shouldEvaluate, refetch]);

  useEffect(() => {
    if (userId !== undefined) return;

    seededDataRef.current = null;
    isShowingRef.current = false;
    restoreFocusRef.current = null;
    setQueue([]);
    setCursor(0);
    clearDismissedCache();
  }, [userId]);

  return {
    currentEntry: queue[cursor] ?? null,
    position: cursor + 1,
    total: queue.length,
    onDismiss
  };
};

export default useBirthdayNotifications;
