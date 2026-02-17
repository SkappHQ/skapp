import {
  ApiVersions,
  moduleAPIPath
} from "~community/common/constants/configs";
import {
  SortKeyTypes,
  SortOrderTypes
} from "~community/common/types/CommonTypes";

export const organizationCreateEndpoints = {
  CREATE_ORGANIZATION: `/organization`,
  CHECK_ORG_SETUP_STATUS: `/app-setup-status`
};

export const authenticationEndpoints = {
  CREATE_SUPER_ADMIN: `${moduleAPIPath.AUTH}/signup/super-admin`,
  SIGN_IN: `${moduleAPIPath.AUTH}/sign-in`,
  CREDENTIAL_SIGN_IN: `${ApiVersions.V1}/auth/session/sign-in`,
  CREDENTIAL_SIGN_UP: `${ApiVersions.V1}/auth/signup/super-admin`,
  RESET_PASSWORD: `${moduleAPIPath.AUTH}/reset-password`,
  CHANGE_PASSWORD: (userId: string | number) =>
    `${moduleAPIPath.AUTH}/change/password/${userId}`,
  CHECK_EMAIL: `${moduleAPIPath.PEOPLE}/search/email-exists`,
  REQUEST_PASSWORD_CHANGE: `${moduleAPIPath.AUTH}/forgot/password`
};

export const timeConfigurationEndPoints = {
  GET_DEFAULT_CAPACITY: () => `${moduleAPIPath.TIME}/config`,
  GET_CONFIG_IS_REMOVABLE: () => `${moduleAPIPath.TIME}/config/is-removable`
};

export const notificationEndpoints = {
  GET_NOTIFICATION_SETTINGS: `${moduleAPIPath.PEOPLE}/user/notification/settings`,
  UPDATE_NOTIFICATION_SETTINGS: `${moduleAPIPath.PEOPLE}/user/notification/settings`
};

export const emailServerConfigEndpoints = {
  GET_EMAIL_SERVER_CONFIG: `${moduleAPIPath.ORGANIZATION}/configs`,
  UPDATE_EMAIL_SERVER_CONFIG: `${moduleAPIPath.ORGANIZATION}/configs/email`,
  TEST_EMAIL_SERVER: `email/test`
};

export const notificationsEndpoints = {
  GET_NOTIFICATIONS: (
    page: number,
    size: number,
    sortOrder: SortOrderTypes,
    sortKey: SortKeyTypes,
    isViewed?: boolean | string
  ) =>
    `/notification?page=${page}&size=${size}&sortOrder=${sortOrder}&sortKey=${sortKey}&isViewed=${isViewed}`,
  MARK_NOTIFICATION_AS_READ: (notificationId: number) =>
    `/notification/${notificationId}`,
  MARK_ALL_NOTIFICATION_AS_READ: `/notification`,
  GET_NOTIFICATIONS_COUNT: `/notification/unread-count`
};

export const applicationVersionEndpoints = {
  GET_APPLICATION_VERSION_UPDATES: (language: string) =>
    `/check-updates?language=${language}`
};

export const storageAvailabilityEndpoints = {
  GET_STORAGE_AVAILABILITY: `/file/storage/availability`
};
