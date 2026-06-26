import { type SxProps } from "@mui/material";
import { AppProps } from "next/app";
import { JSX } from "react";
import { type FileRejection } from "react-dropzone";
import { StoreApi } from "zustand";

import { TimeBlocksTypes } from "~community/configurations/types/TimeConfigurationsTypes";
import { ManagerType } from "~community/people/types/EditEmployeeInfoTypes";
import { EmployeeManagerType } from "~community/people/types/EmployeeTypes";
import { HolidayDurationType } from "~community/people/types/HolidayTypes";

import { daysTypes } from "../constants/stringConstants";

type ResourcesType = Record<
  string,
  {
    translation: Record<string, string>;
  }
>;

export type TranslatorFunctionType = (
  suffixes: string[],
  interpolationValues?: Record<string, string>
) => string;

export interface MyAppPropsType extends AppProps {
  initialI18nStore: ResourcesType;
  initialLanguage: string;
}

export type StyleProps = Record<string, SxProps>;

export interface DropdownListType {
  label: string | number | JSX.Element;
  value: string | number;
  emoji?: string;
}

export interface ErrorResponse {
  response: {
    data: {
      results: { message?: string; code?: number; messageKey?: string }[];
    };
    status?: number;
  };
  message?: string;
  code?: number | string;
}

export enum ManagerTypes {
  PRIMARY = "PRIMARY",
  SECONDARY = "SECONDARY",
  INFORMANT = "INFORMANT"
}

export type FileUploadType = { file?: File; name: string; path: string };

export type SetType<T> = StoreApi<T>["setState"];

export type FileRejectionType = Partial<FileRejection>;

export enum PermissionTypes {
  ADMIN = "ADMIN",
  USER = "USER",
  MANAGER = "MANAGERS",
  SUB_ADMIN = "SUB_ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
  EMPLOYEES = "EMPLOYEES"
}

export enum PermissionTypesForEmployeeFilter {
  EMPLOYEE = "Employee",
  MANAGER = "Manager",
  SUPER_ADMIN = "Super Admin"
}

export enum SortKeyTypes {
  NAME = "NAME",
  JOIN_DATE = "JOIN_DATE",
  TEAM_NAME = "TEAM_NAME",
  CREATED_DATE = "CREATED_DATE",
  DATE = "DATE",
  START_DATE = "START_DATE",
  CREATION_DATE = "CREATION_DATE"
}

export enum SortOrderTypes {
  ASC = "ASC",
  DESC = "DESC"
}

export interface FilterSearchSuggestionsType {
  id?: number;
  text?: string;
  name?: string;
}

export interface FilterButtonTypes {
  id?: string | number;
  text: string;
}

export interface LocalStorageUserDetailsType {
  accessToken: string;
  currentUserRole: string;
  email: string;
  firstName: string;
  fullName: string;
  isLoggedIn: boolean;
  lastName: string;
  picture: string;
  designation: string;
  employeeID: string;
  managers: ManagerType[];
  roles: string[];
  address: string;
}

export interface OptionType {
  id: number;
  name: string;
}

export interface TimeConfigurationType {
  day: daysTypes;
  timeBlocks: Array<TimeBlocksTypes>;
  totalHours: number;
  isWeekStartDay?: boolean;
  startTime?: string;
}

export interface EmployeeSearchResultType {
  employeeId: number;
  name: string;
  lastName: string;
  designation: string;
  authPic: string;
  identificationNo: number;
  permission?: string;
  email?: string;
  firstName: string;
}

export interface TeamSearchResultType {
  teamId: number;
  teamName: string;
}

export interface EmployeeTeamSearchResultType {
  employeeResponseDtoList: EmployeeSearchResultType[];
  teamResponseDtoList: TeamSearchResultType[];
}

export type UserDetails = {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  picture: string;
  roles: string[];
  currentUserRole: string;
  isLoggedIn: boolean;
  designation: string;
  employeeID: string;
  address: string;
  managers: EmployeeManagerType[];
  identificationNo?: string;
  jobRole: string;
  jobLevel: string;
};

export enum ModuleTypes {
  PEOPLE = "PEOPLE",
  TIME = "TIME",
  LEAVE = "LEAVE",
  ASSET = "ASSET"
}

export type ActiveModuleTypes = {
  [key in ModuleTypes]: boolean;
};

export type AuthError = {
  title: string;
  description?: string;
  errorFromServer?: string;
};

export interface CustomLeavesTypes {
  items: CustomLeaveTypes[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export interface CustomLeaveTypes {
  entitlementId: number;
  leaveType: {
    typeId: number;
    name: string;
    emojiCode: string;
  };
  totalDaysAllocated: number;
  totalDaysUsed: number;
  employee: {
    employeeId: string;
    firstName: string;
    authPic: string;
    lastName: string;
  };
  validFrom?: string;
  validTo?: string;
  employeeId: number;
  numberOfDaysOff: number;
  typeId: number;
}

export interface ManagerTeamEmployeeType {
  employeeId: string;
  name: string;
  lastName: string;
  designation: string;
  authPic: string;
}

export interface ManagerTeamEmployeesType {
  employee: ManagerTeamEmployeeType;
  lead: boolean;
}

export interface ManagerTeamType {
  teamId: number;
  teamName: string;
  employees: ManagerTeamEmployeesType[];
  onLeaveCount?: number | null;
  onlineCount?: number | null;
  isNonWorkingDay?: boolean;
}

// The backend expects the leave state to be one of the following:
export enum LeaveStates {
  FULL_DAY = "FULLDAY",
  MORNING = "HALFDAY_MORNING",
  EVENING = "HALFDAY_EVENING",
  NONE = "NONE"
}

export type XIndexTypes = {
  startIndex: number;
  endIndex: number;
};

export enum AppBarItemTypes {
  NOTIFICATION = "Notifications",
  ACCOUNT_DETAILS = "Account Details"
}

export enum LeaveRequestStates {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  CANCELLED = "CANCELLED",
  DENIED = "DENIED"
}

export enum AnalyticsTypes {
  LEAVE = "leaveAnalytics",
  TIME = "timeSheetAnalytics"
}

export type TableHeaderTypes = {
  id: string | number;
  label?: string;
};

export type HTMLTableHeaderTypes = {
  id: string | number;
  label: string;
  ariaLabel?: string;
  sticky?: boolean;
  subtitle?: {
    text?: string;
    emoji?: string;
    isChip?: boolean;
    duration?: HolidayDurationType;
  };
};

export type TableTypes = {
  tableName: string;
};
