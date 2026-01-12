export interface NotificationDataTypes {
  id: number;
  createdDate: string;
  title: string;
  body: string;
  notificationType: NotificationItemsTypes | null;
  isViewed: boolean;
  isCausedByCurrentUser: boolean;
  resourceId: number;
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
  TIME_ENTRY = "TIME_ENTRY"
}

export const notificationDefaultImage = "/logo/skapp-thumbnail_16_16.svg";
