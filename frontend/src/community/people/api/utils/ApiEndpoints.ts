import { moduleAPIPath } from "~community/common/constants/configs";

export const peoplesEndpoints = {
  GET_PENDING_EMPLOYEE_COUNT: `${moduleAPIPath.PEOPLE}/pending-employee-count`,
  GET_EMPLOYEES: `${moduleAPIPath.PEOPLE}/employees?`,
  ADD_EMPLOYEE: `${moduleAPIPath.PEOPLE}/employee`,
  BULK_LEAVES: `${moduleAPIPath.LEAVE}/entitlement/bulk`,
  SEARCH_EMPLOYEE: `${moduleAPIPath.PEOPLE}/search/employee`,
  CHECK_EXISTING_EMAIL_EMPID: `${moduleAPIPath.PEOPLE}/check-email-identification-no`,
  JOB_ROLES: `${moduleAPIPath.JOB}/family`,
  QUICK_ADD_EMPLOYEE: `${moduleAPIPath.PEOPLE}/employee/quick-add`,
  EMPLOYEE_BY_ID: (id: number) => `${moduleAPIPath.PEOPLE}/employee/${id}`,
  EDIT_EMPLOYEE: (employeeId: string | number) =>
    `${moduleAPIPath.PEOPLE}/employee/${employeeId}`,
  EDIT_ME: (employeeId: string | number) =>
    `${moduleAPIPath.PEOPLE}/employee/me/${employeeId}`,
  ME: `${moduleAPIPath.PEOPLE}/me`,
  EMPLOYEE_TIMELINE: (memberId: number) =>
    `${moduleAPIPath.PEOPLE}/ep/employees/timeline/${memberId}`,
  USER_BULK_UPLOAD: `${moduleAPIPath.PEOPLE}/bulk/employees`,
  TERMINATE_EMPLOYEE: (employeeId: string | number) =>
    `${moduleAPIPath.PEOPLE}/user/terminate/${employeeId}`,
  SEARCH_EMPLOYEE_TEAM_ADMIN: `${moduleAPIPath.PEOPLE}/search/employee-team`,
  CHECK_IF_CURRENT_USER_HAS_MANAGERS_AVAILABILITY: `${moduleAPIPath.PEOPLE}/me/managers/availability`,
  MY_MANAGERS: `${moduleAPIPath.PEOPLE}/me/managers`,
  SUPERVISED_BY_ME: (employeeId: number) =>
    `${moduleAPIPath.PEOPLE}/${employeeId}/is-supervised-by-me`,
  REVITE_EMPLOYEES: `${moduleAPIPath.AUTH}/re-invitation`,
  DELETE_USER: (employeeId: string | number) =>
    `${moduleAPIPath.PEOPLE}/user/delete/${employeeId}`,
  HAS_SUPERVISOR_ROLES: (employeeId: number) =>
    `${moduleAPIPath.PEOPLE}/${employeeId}/has-supervisory-roles`,
  EXPORT_PEOPLE_DIRECTORY: `/people/employees/export`
};

export const authEndpoints = {
  SHARE_PASSWORD: (userId: number) =>
    `${moduleAPIPath.AUTH}/share-password/${userId}`,
  RESET_SHARE_PASSWORD: (userId: number) =>
    `${moduleAPIPath.AUTH}/reset/share-password/${userId}`
};

export const fileUploadEndpoints = {
  UPLOAD_IMAGES: `file/upload`,
  DOWNLOAD_IMAGES: (type: string, file: string, isThumbnail: boolean) =>
    `file?type=${type}&filename=${file}&isThumbnail=${isThumbnail}`
};

export const teamEndpoints = {
  TEAMS: `/teams`,
  MY_TEAMS: `/teams/me`,
  UPDATE_TEAM: (teamId: number) => `/teams/${teamId}`,
  MANAGER_ALL_TEAMS: `teams/manager`,
  TRANSFER_TEAM: (teamId: string): string => `teams/team-transfer/${teamId}`,
  TEAM_BY_ID: (teamId: number) => `/teams/${teamId}`
};

export const jobFamilyEndpoints = {
  JOB_FAMILY: `/job/family`,
  JOB_FAMILY_WITH_ID: (jobFamilyId: number) => `/job/family/${jobFamilyId}`,
  JOB_TITLE_WITH_ID: (jobTitleId: number) => `/job/title/${jobTitleId}`,
  EDIT_JOB_FAMILY: (jobFamilyId: number) => `/job/family/${jobFamilyId}`,
  TRANSFER_EMPLOYEES_WITH_JOB_FAMILY_ID: (jobFamilyId: number) =>
    `/job/family/transfer/${jobFamilyId}`,
  TRANSFER_EMPLOYEES_WITH_JOB_TITLE_ID: (jobFamilyId: number) =>
    `/job/title/transfer/${jobFamilyId}`
};

export const holidayEndpoints = {
  HOLIDAY: `/holiday`,
  ADD_HOLIDAY_BULK: "/holiday/bulk",
  ADD_INDIVIDUAL_HOLIDAY: "/holiday/bulk",
  DELETE_SELECTED_HOLIDAYS: "/holiday/selected",
  DELETE_ALL_HOLIDAYS: (currentYear: number) => `/holiday/${currentYear}`,
  GET_HOLIDAY_BY_DATE: "/holiday"
};

export const peopleDashboardEndpoints = {
  GET_EMPLOYMENT_BREAKDOWN_GRAPH_DATA: (): string =>
    `/people/analytics/employment-breakdown`,
  GET_GENDER_DISTRIBUTION_GRAPH_DATA: (): string =>
    `/people/analytics/gender-distribution`,
  GET_JOB_FAMILY_OVERVIEW_GRAPH_DATA: (): string =>
    `/people/analytics/job-family-overview`,
  GET_PEOPLE_DASHBOARD_ANALYTICS_DATA: (): string =>
    `/people/analytics/dashboard-summary`
};
