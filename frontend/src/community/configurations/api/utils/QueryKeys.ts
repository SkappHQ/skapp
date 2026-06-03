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
  GET_WORK_LOCATIONS: (search: string, page: number, size: number) => [
    "work-locations",
    search,
    page,
    size
  ],
  GET_WORK_LOCATIONS_INFINITE: (search: string, size: number) => [
    "work-locations",
    "infinite",
    search,
    size
  ],
  GET_WORK_LOCATION_BY_ID: (id: number) => ["work-location", id],
  CHECK_WORK_LOCATION_NAME_EXISTS: (name: string) => [
    "work-locations",
    "name-exists",
    name
  ]
};