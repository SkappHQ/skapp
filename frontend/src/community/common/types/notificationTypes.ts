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
  ESIGN_DOCUMENT_SIGN_REQUEST = "ESIGN_DOCUMENT_SIGN_REQUEST",
  ESIGN_DOCUMENT_COMPLETED = "ESIGN_DOCUMENT_COMPLETED",
  ESIGN_DOCUMENT_DECLINED = "ESIGN_DOCUMENT_DECLINED",
  ESIGN_DOCUMENT_VOIDED = "ESIGN_DOCUMENT_VOIDED",
  ESIGN_DOCUMENT_REMINDER = "ESIGN_DOCUMENT_REMINDER",
  ESIGN_DOCUMENT_EXPIRED = "ESIGN_DOCUMENT_EXPIRED"
}

export const notificationDefaultImage = "/logo/skapp-thumbnail_16_16.svg";
