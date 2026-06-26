export interface MenuitemsDataTypes {
  title: string;
  type: string;
  buttons: FilterButtonTypes[];
}

export interface FilterButtonTypes {
  id?: string | number;
  text: string;
}

export enum DataFilterEnums {
  GENDER = "gender",
  EMPLOYMENT_TYPES = "employmentTypes",
  TEAM = "teamId",
  ROLE = "role",
  EMPLOYMENT_STATUS = "employmentStatus",
  EMPLOYMENT_ALLOCATIONS = "employmentAllocations",
  PERMISSIONS = "permissions"
}

export interface ReportsFilterTypes {
  leaveType: string[];
  leaveStatus: string[];
}
