import { Modules } from "~community/common/enums/CommonEnums";

export const timeConfigurationQueryKeys = {
  TIME_CONFIGURATIONS: ["time-configurations"],
  CONFIG_IS_REMOVEVABLE: ["config-is-removable"]
};

export const userRolesQueryKeys = {
  ALL: ["user-role-configurations"],
  USER_ROLES: ["user-roles"],
  SUPER_ADMIN_COUNT: ["super-admin-count"],
  USER_ROLE_RESTRICTIONS: function (module: Modules) {
    return [...(this?.ALL || []), "user-role-restrictions", module];
  },
  ALLOWED_GRANTABLE_PERMISSIONS: ["allowed-grantable-permissions"]
};

export const workLocationQueryKeys = {
  ALL: ["work-locations"],
  GET_WORK_LOCATIONS: (search: string, page: number) => [
    "work-locations",
    search,
    page
  ]
};