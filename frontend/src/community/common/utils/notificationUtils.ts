import { DateTime } from "luxon";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { FC } from "react";

import AttendanceModuleIcon from "~community/common/assets/Icons/AttendanceModuleIcon";
import EsignatureModuleIcon from "~community/common/assets/Icons/EsignatureModuleIcon";
import LeaveModuleIcon from "~community/common/assets/Icons/LeaveModuleIcon";
import ROUTES from "~community/common/constants/routes";
import { TimePeriodEnums } from "~community/common/enums/CommonEnums";
import { IconProps } from "~community/common/types/IconTypes";
import {
  NotificationDataTypes,
  NotificationItemsTypes,
  NotificationSummaryItem,
  NotificationSummaryType
} from "~community/common/types/notificationTypes";

export const getNotificationCount = (
  summaryResults: NotificationSummaryItem[] | undefined,
  type: NotificationSummaryType
): number => {
  return (
    summaryResults?.find((item) => item.notificationType === type)
      ?.notificationCount ?? 0
  );
};

export const getNotificationIcon = (
  notificationType: NotificationItemsTypes | null
): FC<IconProps> | null => {
  switch (notificationType) {
    case NotificationItemsTypes.LEAVE_REQUEST:
      return LeaveModuleIcon;
    case NotificationItemsTypes.TIME_ENTRY:
      return AttendanceModuleIcon;
    case NotificationItemsTypes.ESIGN_DOCUMENT_SIGN_REQUEST:
    case NotificationItemsTypes.ESIGN_DOCUMENT_COMPLETED:
    case NotificationItemsTypes.ESIGN_DOCUMENT_DECLINED:
    case NotificationItemsTypes.ESIGN_DOCUMENT_VOIDED:
    case NotificationItemsTypes.ESIGN_DOCUMENT_REMINDER:
    case NotificationItemsTypes.ESIGN_DOCUMENT_EXPIRED:
    case NotificationItemsTypes.ESIGN_DOCUMENT_COMPLETED_OWNER:
    case NotificationItemsTypes.ESIGN_DOCUMENT_DECLINED_OWNER:
      return EsignatureModuleIcon;
    default:
      return null;
  }
};

const TIME_PERIOD_ORDER: TimePeriodEnums[] = [
  TimePeriodEnums.TODAY,
  TimePeriodEnums.YESTERDAY,
  TimePeriodEnums.LAST_7_DAYS,
  TimePeriodEnums.LAST_30_DAYS,
  TimePeriodEnums.OLDER
];

const getTimePeriod = (dateStr: string): TimePeriodEnums => {
  const today = DateTime.now().startOf("day");

  const notificationDate = DateTime.fromISO(dateStr).startOf("day");

  const diffDays = today.diff(notificationDate, "days").days;

  if (diffDays === 0) return TimePeriodEnums.TODAY;
  if (diffDays === 1) return TimePeriodEnums.YESTERDAY;
  if (diffDays <= 7) return TimePeriodEnums.LAST_7_DAYS;
  if (diffDays <= 30) return TimePeriodEnums.LAST_30_DAYS;
  return TimePeriodEnums.OLDER;
};

export const groupNotificationsByTimePeriod = (
  items: NotificationDataTypes[]
): { period: TimePeriodEnums; items: NotificationDataTypes[] }[] => {
  const groupMap = new Map<TimePeriodEnums, NotificationDataTypes[]>();

  for (const item of items) {
    const period = getTimePeriod(item.createdDate);
    const existing = groupMap.get(period) ?? [];
    existing.push(item);
    groupMap.set(period, existing);
  }

  return TIME_PERIOD_ORDER.filter((period) => groupMap.has(period)).map(
    (period) => ({
      period,
      items: groupMap.get(period)!
    })
  );
};

interface HandleNotifyRowParams {
  id: number;
  resourceId?: string;
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
  resourceId,
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
  } else if (
    notificationType === NotificationItemsTypes.ESIGN_DOCUMENT_SIGN_REQUEST ||
    notificationType === NotificationItemsTypes.ESIGN_DOCUMENT_REMINDER ||
    notificationType === NotificationItemsTypes.ESIGN_DOCUMENT_EXPIRED
  ) {
    if (resourceId) {
      const [envelopeId, documentId, recipientId] = resourceId.split(",");
      router.push(
        `${ROUTES.SIGN.SIGN}?isInternalUser=true&envelopeId=${envelopeId}&documentId=${documentId}&recipientId=${recipientId}`
      );
    }
  } else if (
    notificationType ===
      NotificationItemsTypes.ESIGN_DOCUMENT_COMPLETED_OWNER ||
    notificationType === NotificationItemsTypes.ESIGN_DOCUMENT_DECLINED_OWNER ||
    notificationType === NotificationItemsTypes.ESIGN_DOCUMENT_COMPLETED
  ) {
    if (resourceId && !isNaN(Number(resourceId))) {
      router.push(ROUTES.SIGN.SENT_INFO.ID(Number(resourceId)));
    }
  } else if (
    notificationType === NotificationItemsTypes.ESIGN_DOCUMENT_DECLINED ||
    notificationType === NotificationItemsTypes.ESIGN_DOCUMENT_VOIDED
  ) {
    if (resourceId && !isNaN(Number(resourceId))) {
      router.push(ROUTES.SIGN.INBOX_INFO.ID(Number(resourceId)));
    }
  }
  mutate(id);
};
