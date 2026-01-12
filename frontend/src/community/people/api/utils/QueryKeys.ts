import { EmployeeDataParamsTypes } from "~community/people/types/EmployeeTypes";

export const peopleQueryKeys = {
  all: ["super-admin"],
  PENDING_EMPLOYEE_COUNT: ["pending-employee-count"],
  ALL_EMPLOYEE_DATA: function (params?: EmployeeDataParamsTypes) {
    return ["all-employee-data", params].filter((val) => val !== undefined);
  },
  EMPLOYEE_DATA_TABLE: function (params?: {
    page?: number;
    sortKey?: string;
    sortOrder?: string;
  }) {
    return ["employee-table-data", params].filter((val) => val !== undefined);
  },
  EMPLOYEE_COUNT: function () {
    return [...(this?.all || []), "employee-count"];
  },
  EMPLOYEE_SEARCH: function (searchTerm: string, permission: string) {
    return [...(this?.all || []), "employees-search", searchTerm, permission];
  },
  EMPLOYEE_DATA_EXIST_KEYS: function (
    workEmail?: string,
    identificationNo?: string
  ) {
    return [
      ...(this?.all || []),
      "employee-data-exist-keys",
      workEmail,
      identificationNo
    ].filter((val) => val !== undefined);
  },
  PRE_PROCESSED_ROLES: function () {
    return ["job-role", "preprocess-job-roles"];
  },
  EMPLOYEE_BY_ID: function (id?: number) {
    return ["employee-by-id", id];
  },
  GET_ME: ["me"],
  MY_MANAGERS: ["my-managers"],
  CHECK_IF_CURRENT_USER_HAS_MANAGERS: ["check-if-current-user-has-managers"],
  getAnalyticEmployeeTeam: function (searchTerm?: string) {
    return ["search-employee-team", searchTerm];
  },
  SHARE_PASSWORD: function (userId?: number) {
    return ["share-password", userId];
  },
  RESET_SHARE_PASSWORD: function (userId?: number) {
    return ["reset-share-password", userId];
  },
  EMPLOYEE_DATA_EXIST_KEYS_QUICK_ADD: function (
    workEmail?: string,
    identificationNo?: string
  ) {
    return [
      ...(this?.all || []),
      "employee-data-exist-keys-quick-add",
      workEmail,
      identificationNo
    ].filter((val) => val !== undefined);
  },
  SUPERVISED_BY_ME: ["supervised-by-me"],
  HAS_SUPERVISOR_ROLES: ["has-supervisor-roles"],
  EXPORT_PEOPLE_DIRECTORY: ["export-people-directory"]
};

export const teamQueryKeys = {
  ALL_TEAMS: ["all-teams"],
  MY_TEAMS: ["my-teams"],
  GET_ALL_TEAMS: ["get-all-teams"],
  GET_TEAM_BY_ID: ["get-team-by-id"],
  teams: function () {
    return [...(this?.ALL_TEAMS || []), "get-teams"];
  },
  searchedTeam: function (searchedTeams?: string) {
    return [
      ...(this?.ALL_TEAMS || []),
      "getSearchedTeams",
      searchedTeams
    ].filter((val) => val !== undefined);
  }
};

export const jobFamilyQueryKeys = {
  ALL: ["job-families"],
  ALL_JOB_FAMILIES: ["all-job-families"],
  JOB_FAMILY_BY_ID: function (jobFamilyId: number) {
    return [...(this?.ALL || []), "job-family-by-id", jobFamilyId.toString()];
  },
  JOB_TITLE_BY_ID: ["job-title-by-id"]
};

export const holidayQueryKeys = {
  ALL_HOLIDAYS: (params?: {
    page?: number;
    year?: string;
    sortOrder?: string;
    isExport?: boolean;
  }) => ["all-holidays", params].filter((val) => val !== undefined),
  ADD_BULK_CALENDAR: ["add-bulk-calendar"],
  ADD_INDIVIDUAL_HOLIDAY: ["add-individual-holiday"],
  DELETE_SELECTED_HOLIDAYS: ["delete-selected-holidays"],
  DELETE_ALL_HOLIDAYS: ["delete-all-holidays"],
  GET_HOLIDAY_BY_DATE: ["get-holiday-by-date"]
};

export const managerQueryKeys = {
  managerAllTeams: ["managerAllTeams"]
};

export const getPeopleDashboardQueryKeys = {
  employmentBreakdownGraphData: function (teams: number | string) {
    return ["employmentBreakdownGraphData", teams].filter(
      (val) => val !== undefined
    );
  },
  genderDistributionGraphData: function (teams: number | string) {
    return ["genderDistributionGraphData", teams].filter(
      (val) => val !== undefined
    );
  },
  jobFamilyOverviewGraphData: function (teams: number | string) {
    return ["jobFamilyOverviewGraphData", teams].filter(
      (val) => val !== undefined
    );
  },
  peopleDashboardAnalyticsData: function (teams: number | string) {
    return ["peopleDashboardAnalyticsData", teams].filter(
      (val) => val !== undefined
    );
  }
};
