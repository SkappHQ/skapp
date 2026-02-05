export interface NotificationDataTypes {
  id: number;
  createdDate: string;
  title: string;
  body: string;
  notificationType: NotificationItemsTypes | null;
  isViewed: boolean;
  isCausedByCurrentUser: boolean;
  resourceId: string;
  authPic?: string;
}

export enum NotifyFilterButtonTypes {
  ALL = "all",
  UNREAD = "unread",
  AllREAD = "allRead"
}

export interface NotificationTypes {
  items: NotificationDataTypes[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export enum NotificationItemsTypes {
  LEAVE_REQUEST = "LEAVE_REQUEST",
  TIME_ENTRY = "TIME_ENTRY",
  DOCUMENT_SIGN_REQUEST = "DOCUMENT_SIGN_REQUEST",
  DOCUMENT_COMPLETED = "DOCUMENT_COMPLETED",
  DOCUMENT_DECLINED = "DOCUMENT_DECLINED",
  DOCUMENT_VOIDED = "DOCUMENT_VOIDED",
  DOCUMENT_REMINDER = "DOCUMENT_REMINDER",
  DOCUMENT_EXPIRED = "DOCUMENT_EXPIRED"
}

export const notificationDefaultImage = "/logo/skapp-thumbnail_16_16.svg";
