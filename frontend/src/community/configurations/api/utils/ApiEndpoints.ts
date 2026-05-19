import { moduleAPIPath } from "~community/common/constants/configs";
import { Modules } from "~community/common/enums/CommonEnums";

export const timeConfigurationEndPoints = {
  GET_DEFAULT_CAPACITY: () => `${moduleAPIPath.TIME}/config`
};

export const userRolesEndPoints = {
  GET_USER_ROLES: `${moduleAPIPath.ROLES}/system`,
  GET_USER_ROLE_RESTRICTIONS: (module: Modules) =>
    `${moduleAPIPath.ROLES}/restrictions/${module}`,
  UPDATE_USER_ROLE_RESTRICTIONS: `${moduleAPIPath.ROLES}/restrictions`,
  SUPER_ADMIN_COUNT: `${moduleAPIPath.ROLES}/super-admin-count`,
  GET_ALLOWED_GRANTABLE_PERMISSIONS: `${moduleAPIPath.ROLES}`
};

export const workLocationEndpoints = {
  GET_WORK_LOCATIONS: (search: string, page: number, size: number) =>
    `${moduleAPIPath.COMMON}/work-location?searchKeyword=${encodeURIComponent(search)}&page=${page}&size=${size}`,
  GET_WORK_LOCATION_BY_ID: (id: number) =>
    `${moduleAPIPath.COMMON}/work-location/${id}`,
  CHECK_WORK_LOCATION_NAME_EXISTS: (name: string) =>
    `${moduleAPIPath.COMMON}/work-location/name-exists?name=${encodeURIComponent(name)}`,
  CREATE_WORK_LOCATION: `${moduleAPIPath.COMMON}/work-location`,
  UPDATE_WORK_LOCATION: (id: number) =>
    `${moduleAPIPath.COMMON}/work-location/${id}`,
  DELETE_WORK_LOCATION: (id: number) =>
    `${moduleAPIPath.COMMON}/work-location/${id}`
};
