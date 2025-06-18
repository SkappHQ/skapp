import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import ROUTES from "~community/common/constants/routes";
import { NotificationItemsTypes } from "~community/common/types/notificationTypes";

interface HandleNotifyRowParams {
  id: number;
  notificationType: NotificationItemsTypes | null;
  isCausedByCurrentUser: boolean;
  router: AppRouterInstance;
  mutate: (id: number) => void;
  isLeaveEmployee?: boolean;
  isLeaveManager?: boolean;
  isAttendanceManager?: boolean;
  isAttendanceEmployee?: boolean;
}

export const handleNotifyRow = ({
  id,
  notificationType,
  isCausedByCurrentUser,
  router,
  mutate,
  isLeaveEmployee,
  isLeaveManager,
  isAttendanceManager,
  isAttendanceEmployee
}: HandleNotifyRowParams): void => {
  if (
    isCausedByCurrentUser &&
    notificationType === NotificationItemsTypes.LEAVE_REQUEST &&
    isLeaveEmployee
  ) {
    router.push(ROUTES.LEAVE.MY_REQUESTS);
  } else if (
    notificationType === NotificationItemsTypes.LEAVE_REQUEST &&
    isLeaveManager
  ) {
    router.push(ROUTES.LEAVE.LEAVE_REQUESTS);
  } else if (
    isCausedByCurrentUser &&
    notificationType === NotificationItemsTypes.TIME_ENTRY &&
    isAttendanceEmployee
  ) {
    router.push(ROUTES.TIMESHEET.MY_TIMESHEET);
  } else if (
    notificationType === NotificationItemsTypes.TIME_ENTRY &&
    isAttendanceManager
  ) {
    router.push(ROUTES.TIMESHEET.ALL_TIMESHEETS);
  }
  mutate(id);
};
