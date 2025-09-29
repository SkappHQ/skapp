export const organizationCreateQueryKeys = {
  CHECK_ORG_SETUP_STATUS: ["check-org-setup-status"]
};

export const timeConfigurationQueryKeys = {
  TIME_CONFIGURATIONS: ["time-configurations"]
};

export const notificationQueryKeys = {
  GET_NOTIFICATION_SETTINGS: ["notification", "settings"]
};

export const emailServerConfigQueryKeys = {
  EMAIL_SERVER_CONFIG: ["email-server-config"]
};

export const notificationsQueryKeys = {
  GET_NOTIFICATIONS: ["notifications"],
  MARK_NOTIFICATION_AS_READ: ["mark-notification-as-read"],
  MARK_ALL_NOTIFICATION_AS_READ: ["mark-all-notification-as-read"],
  GET_NOTIFICATIONS_COUNT: ["notifications-count"]
};

export const applicationVersionInfoQueryKeys = {
  GET_APPLICATION_VERSION_INFO: (language: string) => [
    "applicaiton-version-info",
    language
  ]
};

export const storageAvailabilityQueryKeys = {
  GET_STORAGE_AVAILABILITY: ["storage-availability"]
};

export const userLanguageQueryKeys = {
  GET_USER_LANGUAGE: ["user-language"]
};
