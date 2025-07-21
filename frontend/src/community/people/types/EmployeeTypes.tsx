import { AccountSignIn } from "~community/common/constants/stringConstants";
import {
  FilterButtonTypes,
  ManagerTypes
} from "~community/common/types/CommonTypes";
import { AccountStatus } from "~community/leave/types/LeaveTypes";

import {
  EmploymentAllocationTypes,
  GenderTypes,
  ModifiedFileType,
  SystemPermissionTypes,
  VisaDetailsType
} from "./AddNewResourceTypes";
import { JobFamilies, JobTitles } from "./JobRolesTypes";

export interface SingleEmployeeResultsType {
  isActive: boolean;
  authPic: string | null;
  designation: string | null;
  email: string | null;
  employeeId: number;
  jobRoleDto: string | null;
  lastName: string | null;
  name: string | null;
  permission: string | null;
  teamResponsteamseDto: TeamResultsType[];
}

export interface TeamEmployee {
  employee: SingleEmployeeResultsType;
  isSupervisor: boolean;
}

export interface TeamType {
  employees?: TeamEmployee[];
  teamId: string | number;
  teamName: string;
  isSupervisor?: boolean;
}

export interface TeamResultsType {
  team: TeamType;
}

export interface Manager {
  employeeId: string | number;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  designation: string | null;
  authPic: string | null;
  identificationNo?: string | null;
  permission: string | null;
  email: string | null;
}

export interface EmployeeManagerType {
  manager: Manager;
  isPrimaryManager: boolean;
  managerType: ManagerTypes;
}

export interface EmployeeDataType {
  employeeId: number;
  employeeName: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  authPic?: string;
  jobRole?: string;
  jobLevel?: string;
  teams?: [] | TeamResultsType[] | number[];
  email?: string;
  isActive?: boolean;
  projectTeams?: string[];
  supervisors?: EmployeeManagerType[];
  identificationNo?: string;
  gender?: string;
  phone?: string;
  personalEmail?: string;
  employeeType?: string;
  managers?: EmployeeManagerType[];
  designation?: string;
  contractState?: string;
  accountSignIn?: AccountSignIn;
  name?: string;
  employmentStatus?: string;
  accountStatus?: string;
}

export enum EmploymentStatusTypes {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  TERMINATED = "TERMINATED"
}

export enum DataFilterEnums {
  EMPLOYMENT_TYPES = "employmentTypes",
  PERMISSION = "permissions",
  TEAM = "team",
  ROLE = "role",
  ACCOUNT_STATUS = "accountStatus",
  EMPLOYMENT_ALLOCATIONS = "employmentAllocations",
  GENDER = "gender",
  NATIONALITY = "nationality",
  EMPLOYEE_TYPE = "employeeType"
}

export interface EmployeeDataFilterTypes {
  employmentTypes: string[];
  permission: string[];
  team: FilterButtonTypes[];
  role: FilterButtonTypes[];
  accountStatus: EmploymentStatusTypes[];
  employmentAllocations: string[];
  gender: GenderTypes | null;
  nationality: string[];
  employeeType: string[];
}

export interface EmployeeDataParamsTypes {
  page?: number;
  sortKey?: string;
  sortOrder?: string;
  searchKeyword?: string;
  isExport?: boolean;
  accountStatus?: EmploymentStatusTypes;
}

export interface JobRole {
  jobRoleId: number;
  name: string;
}

export interface JobLevel {
  jobLevelId: number;
  name: string;
}
export interface BulkEmployeeDetails {
  country: string | null;
  gender: string | null | undefined;
  identificationNo: string | null;
  joinedDate: string | null;
  lastName: string | null;
  middleName: string | null;
  firstName: string | null;
  permission: string | null;
  personalEmail: string | null;
  phone: string | null;
  teams: (string | number)[] | null;
  primaryManager: string | null;
  timeZone: string | null;
  employmentAllocation: string | null;
  accountStatus: AccountStatus;
  eeo: string | null;
  address: string | null;
  addressLine2: string | null;
  workEmail: string | null;
  employeePersonalInfo: EmployeePersonalInfoResponseType;
  employeeProgression: {
    employeeType: EmploymentTypes | null;
    jobFamilyId: string | number | null;
    jobTitleId: string | number | null;
    startDate: string | null;
    endDate: string | null;
    isCurrent: boolean;
  };
  employeeEmergency: EmergencyContactDetailsResponseType;
  employeePeriod: {
    startDate: string | null;
    endDate: string | null;
  };
}

export interface EmployeePersonalInfoResponseType {
  city: string | null | undefined;
  state: string | null | undefined;
  postalCode: string | null | undefined;
  birthDate: string | null | undefined;
  ethnicity: string | null | undefined;
  ssn: string | null | undefined;
  previousEmploymentDetails?: PreviousEmploymentDetailsType[];
  nationality: string | null | undefined;
  nin: string | null | undefined;
  passportNo?: string | null;
  maritalStatus: string | null | undefined;
  socialMediaDetails: {
    linkedIn: string | null | undefined;
    facebook: string | null | undefined;
    instagram: string | null | undefined;
    x: string | null | undefined;
  };
  extraInfo: {
    bloodGroup?: string | null;
    allergies: string | null | undefined;
    dietaryRestrictions: string | null | undefined;
    tshirtSize: string | null | undefined;
  };
}

export enum EmploymentTypes {
  PERMANENT = "PERMANENT",
  INTERN = "INTERN",
  CONTRACT = "CONTRACT"
}

export interface EmergencyContactDetailsResponseType {
  emergencyId?: number;
  name: string | null;
  emergencyRelationship: RelationshipTypes | "" | null;
  contactNo: string | null;
  isPrimary: boolean;
}

export interface PreviousEmploymentDetailsType {
  companyName: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
}

export enum RelationshipTypes {
  SPOUSE = "SPOUSE",
  CHILD = "CHILD",
  PARENT = "PARENT",
  FAMILY = "FAMILY",
  FRIEND = "FRIEND",
  GUARDIAN = "GUARDIAN"
}

export interface EmployeeEmploymentContextType {
  isUniqueEmail: boolean;
  isUniqueEmployeeNo: boolean;
  isUpdate: boolean;
}

export interface EmployeePermission {
  changedBy: Record<string, string | null> | null;
  changedDate: string | null;
  employeePermissionId: number | null;
  permission: string | null;
  assignedPermission?: SystemPermissionTypes[] | null;
  role?: SystemPermissionTypes | null;
}

export interface EmployeeDetails {
  isActive?: boolean;
  accountSignIn?: AccountSignIn;
  authPic: [] | ModifiedFileType[] | string | null | undefined;
  thumbnail: [] | ModifiedFileType[] | string | null | undefined;
  contractState?: string | null;
  contractType?: string | null;
  country: string | null | undefined;
  designation?: string | null;
  email: string;
  workEmail?: string | null;
  employeeId?: string | number;
  employeePermission?: EmployeePermission | null;
  managers?: [] | Array<EmployeeManagerType>;
  gender: string | null;
  identificationNo: string | null | undefined;
  jobFamily?: null | JobFamilies;
  jobTitle?: JobTitles | null;
  joinDate: string | null | undefined;
  lastName: string | null | undefined;
  middleName: string | null | undefined;
  name?: string | null;
  firstName: string | null | undefined;
  permission: string | null;
  personalEmail: string | null | undefined;
  phone: string | undefined | null;
  teams: TeamResultsType[] | [] | number[];
  primaryManager:
    | {
        employeeId: string | number;
        name: string | null;
        lastName: string | null;
      }
    | null
    | number;
  secondaryManager:
    | {
        employeeId: string | number;
        name: string | null;
        lastName: string | null;
      }
    | null
    | number;
  timeZone: string | null | undefined;
  address: string | null | undefined;
  addressLine2: string | null | undefined;
  workHourCapacity?: string | number | null;
  periodResponseDto?: PeriodResponseDtoType | null;
  employmentAllocation: EmploymentAllocationTypes | string;
  employmentStatus: EmploymentStatusTypes | string;
  currentEmploymentType?: string | null;
  eeo: string | null;
  personalInfo?: EmployeePersonalInfoResponseType;
  employeeFamilies: FamilyMemberResponseType[];
  employeeProgressions: {
    progressionId?: number;
    employeeType: EmploymentTypes | string;
    jobTitle?: {
      jobTitleId: number;
      name: string;
    };
    jobFamily?: {
      jobFamilyId: number;
      name: string;
    };
    startDate: string;
    endDate: string;
  }[];
  employeeEmergencies?: EmergencyContactDetailsResponseType[];
  employeeEducations: EducationalDetailsResponseType[];
  employeeVisas: VisaDetailsType[];
  employees?: EmployeeManagerType[];
  probationPeriod?: {
    startDate: string | null | undefined;
    endDate: string | null | undefined;
  };
  employeeEmergency?: EmergencyContactDetailsResponseType[];
  employeePersonalInfo?: EmployeePersonalInfoResponseType;
  employeePeriod?: {
    startDate: string | undefined;
    endDate: string | undefined;
  };
  userRoles: EmployeeRoleType;
  accountStatus?: string | null;
}

export interface FamilyMemberResponseType {
  familyId?: number;
  firstName: string;
  lastName: string;
  gender: GenderTypes | string;
  familyRelationship: RelationshipTypes | string;
  birthDate: string;
  parentName: string;
}
export interface EducationalDetailsResponseType {
  educationId?: number;
  institution: string;
  degree: string;
  specialization: string;
  startDate: string;
  endDate: string;
}

export interface PeriodResponseDtoType {
  id: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface EmployeeSuggestions {
  employeeId: number | null;
  firstName: string;
  lastName: string;
  designation: string | null;
  avatarUrl: string | null;
}

export enum contractStates {
  PROBATION = "PROBATION",
  CONFIRMED = "CONFIRMED",
  INTERN = "INTERN",
  INACTIVE = "INACTIVE",
  PENDING = "PENDING"
}

export enum UserTypes {
  employee = "us-east-1_PbC8Lrm0W_Google",
  manager = "managers",
  admin = "super_admin",
  leave_manager = "leave_manager",
  asset_manager = "asset_manager",
  time_manager = "time_manager",
  people_manager = "people_manager"
}

export interface EmployeeDataResponse {
  pages: any;
  items: EmployeeDataType[];
  totalPages?: number;
  currentPage?: number;
  onSearch?: boolean;
}

export interface EmployeeTableDataResponseType {
  status: string;
  results: EmployeeDataResultsType[];
}

export interface EmployeeDataResultsType {
  items: EmployeeDetails[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  PEOPLE_ADMIN = "PEOPLE_ADMIN",
  PEOPLE_MANAGER = "PEOPLE_MANAGER",
  PEOPLE_EMPLOYEE = "PEOPLE_EMPLOYEE",
  LEAVE_ADMIN = "LEAVE_ADMIN",
  LEAVE_MANAGER = "LEAVE_MANAGER",
  LEAVE_EMPLOYEE = "LEAVE_EMPLOYEE",
  ATTENDANCE_ADMIN = "ATTENDANCE_ADMIN",
  ATTENDANCE_MANAGER = "ATTENDANCE_MANAGER",
  ATTENDANCE_EMPLOYEE = "ATTENDANCE_EMPLOYEE",
  ESIGN_EMPLOYEE = "ESIGN_EMPLOYEE",
  ESIGN_SENDER = "ESIGN_SENDER",
  ESIGN_ADMIN = "ESIGN_ADMIN"
}

export interface EmployeeRoleType {
  isSuperAdmin: boolean;
  attendanceRole: Role;
  peopleRole: Role;
  leaveRole: Role;
  esignRole: Role;
}

export interface EmployeeDataExists {
  isIdentificationNoExists: boolean;
  isWorkEmailExists: boolean;
  isGoogleDomain: boolean;
}

export interface QuickAddEmployeePayload {
  firstName: string;
  lastName: string;
  email: string;
}

export interface EmployeeCredentials {
  tempPassword: string;
  email: string;
}

export interface QuickAddEmployeeResponse {
  employeeId?: string;
  name?: string | null;
  firstName: string;
  lastName: string;
  employeeCredentials: EmployeeCredentials;
}

export interface EmployeeType {
  employeeId: number | string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  jobRole?: {
    jobRoleId: number;
    name: string;
  };
  jobLevel?: {
    jobLevelId: number;
    name: string;
  };
  accountStatus?: string;
  email?: string;
  authPic?: string;
}

export interface MyManagersType {
  authPic: string;
  employeeId: number;
  firstName: string;
  lastName: string;
  managerType: ManagerTypes;
  middleName: string | null;
  isPrimaryManager: boolean;
}
