import { type FormikProps } from "formik";
import { ChangeEvent } from "react";

import { TitleEnum } from "~community/people/enums/PeopleEnums";

import {
  EmployeeDataType,
  EmployeeRoleType,
  EmploymentStatusTypes,
  Role
} from "./EmployeeTypes";

export type ModifiedFileType = File & { preview: string; path: string };

export interface ManagerStoreType {
  employeeId: string | number | undefined;
  firstName: string;
  lastName: string;
  avatarUrl: string;
}

export interface EmployeeGeneralDetailsTypes {
  authPic: [] | ModifiedFileType[] | string | null | undefined;
  thumbnail: [] | ModifiedFileType[] | string | null | undefined;
  title: TitleEnum | null | undefined;
  firstName: string | null | undefined;
  middleName: string | null | undefined;
  lastName: string | null | undefined;
  gender: GenderTypes | "" | null;
  birthDate: string | null | undefined;
  nationality: string | null | undefined;
  nin: string | null | undefined;
  passportNumber: string | null | undefined;
  maritalStatus: string | null | undefined;
  authPicUrl?: [] | ModifiedFileType[] | string | null | undefined;
}

export interface EmployeeContactDetailsTypes {
  personalEmail: string | null | undefined;
  countryCode: string;
  phone: string | undefined;
  addressLine1: string | null | undefined;
  addressLine2: string | null | undefined;
  city: string | null | undefined;
  country: string | null | undefined;
  state: string | null | undefined;
  postalCode: string | null | undefined;
}

export interface FamilyMemberType {
  familyId?: number;
  firstName: string;
  lastName: string;
  gender: GenderTypes | string;
  relationship: RelationshipTypes | string;
  birthDate: string;
  parentName: string;
}
export interface EmployeeFamilyDetailsTypes {
  familyMembers: FamilyMemberType[];
}

export interface EducationalDetailsType {
  educationId?: number;
  institutionName: string;
  degree: string;
  major: string;
  startDate: string;
  endDate: string;
}

export interface EmployeeEducationalDetailsTypes {
  educationalDetails: EducationalDetailsType[];
}

export interface EmployeeSocialMediaDetailsTypes {
  linkedIn: string | null | undefined;
  facebook: string | null | undefined;
  instagram: string | null | undefined;
  x: string | null | undefined;
}

export interface EmployeeHealthAndOtherDetailsTypes {
  bloodGroup: BloodGroupTypes | null | undefined | string;
  allergies: string | null | undefined;
  dietaryRestrictions: string | null | undefined;
  tshirtSize: string | null | undefined;
}

export interface EmergencyContactDetailsType {
  emergencyId?: number;
  name: string;
  relationship: RelationshipTypes | "";
  countryCode: string;
  phone: string;
}

export interface EmployeeEmergencyDetailsTypes {
  primaryEmergencyContact: EmergencyContactDetailsType;
  secondaryEmergencyContact: EmergencyContactDetailsType;
}

export interface EmployeeEmploymentDetailsTypes {
  employeeNumber: string | null | undefined;
  workEmail: string | undefined;
  employmentStatus?: EmploymentStatusTypes | "";
  employmentAllocation: EmploymentAllocationTypes | "";
  systemPermission?: SystemPermissionTypes | "";
  teams: number[];
  primarySupervisor: ManagerStoreType;
  secondarySupervisor: ManagerStoreType;
  joinedDate: string | null | undefined;
  probationStartDate: string | undefined;
  probationEndDate: string | undefined;
  workTimeZone: string | null | undefined;
  workLocationId: number | null | undefined;
}

export interface PositionDetailsType {
  progressionId?: number;
  employeeType: EmploymentTypes | "";
  jobFamily: number | string;
  jobTitle: number | string;
  startDate: string;
  endDate: string;
  currentPosition: boolean;
}

export interface EmployeeCareerDetailsTypes {
  positionDetails: PositionDetailsType[];
}

export interface EmployeeIdentificationAndDiversityDetailsTypes {
  ssn: string | null | undefined;
  ethnicity: string | null | undefined;
  eeoJobCategory: EEOJobCategoryTypes | "";
}

export interface PreviousEmploymentDetailsType {
  companyName: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
}

export interface EmployeePreviousEmploymentDetailsTypes {
  previousEmploymentDetails: PreviousEmploymentDetailsType[];
}

export interface VisaDetailsType {
  visaId?: number;
  visaType: string;
  issuingCountry: string;
  issuedDate: string;
  expirationDate: string;
}

export interface EmployeeVisaDetailsTypes {
  visaDetails: VisaDetailsType[];
}

export interface EmployeeEntitlementsDetailType {
  year: string;
  leaveType: string;
  leaveName: string;
  numDays: string;
  effectiveFrom: string;
  expirationDate: string;
}

export interface EmployeeProfileDetailsTypes {
  teams: string[];
  careerDetails: PositionDetailsType[];
}

export interface EmployeeType {
  employeeId?: string | number;
  generalDetails: EmployeeGeneralDetailsTypes;
  contactDetails: EmployeeContactDetailsTypes;
  familyDetails: EmployeeFamilyDetailsTypes;
  educationalDetails: EmployeeEducationalDetailsTypes;
  socialMediaDetails: EmployeeSocialMediaDetailsTypes;
  healthAndOtherDetails: EmployeeHealthAndOtherDetailsTypes;
  emergencyDetails: EmployeeEmergencyDetailsTypes;
  employmentDetails: EmployeeEmploymentDetailsTypes;
  careerDetails: EmployeeCareerDetailsTypes;
  identificationAndDiversityDetails: EmployeeIdentificationAndDiversityDetailsTypes;
  previousEmploymentDetails: EmployeePreviousEmploymentDetailsTypes;
  visaDetails: EmployeeVisaDetailsTypes;
  userRoles: EmployeeRoleType;
}

export interface EmployeeEmploymentDetailsFormTypes {
  employeeNumber: string;
  workEmail: string;
  employmentAllocation: EmploymentAllocationTypes | "";
  teams: number[];
  employmentStatus: EmploymentStatusTypes;
  primarySupervisor: ManagerStoreType;
  secondarySupervisor: ManagerStoreType;
  joinedDate: string;
  probationStartDate: string;
  probationEndDate: string;
  workTimeZone: string;
  workLocationId: number | null;
}

export interface SelectedFileTypes {
  path: string;
  preview: string;
}

export enum EmploymentTypes {
  PERMANENT = "PERMANENT",
  INTERN = "INTERN",
  CONTRACT = "CONTRACT"
}

export enum AddNewResourceModalsTypes {
  AddPersonalDetailsModal = "AddPersonalDetailsModal",
  AddEmployeeDetailsModal = "AddEmployeeDetailsModal",
  AddMoreEmployeeDetailsModal = "AddMoreEmployeeDetailsModal",
  AddNewResourceSuccessModal = "AddNewResourceSuccessModal",
  AddNewResourceAbandonModal = "AddNewResourceAbandonModal",
  DEFAULT_ENTITLEMENTS = "Default entitlements",
  ADD_ENTITLEMENTS = "Add entitlements",
  NEW_ENTITLEMENTS = "New entitlements",
  CONFIRM_DELETION = "Confirm deletion"
}

export interface DefaultEntitlementsTabelHeadType {
  leaveType: string;
  column1: string;
  column2: string;
}

export enum GenderTypes {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER"
}

export enum MaritalStatusTypes {
  SINGLE = "SINGLE",
  MARRIED = "MARRIED",
  DIVORCED = "DIVORCED",
  WIDOWED = "WIDOWED"
}

export enum RelationshipTypes {
  SPOUSE = "SPOUSE",
  CHILD = "CHILD",
  PARENT = "PARENT",
  FAMILY = "FAMILY",
  FRIEND = "FRIEND",
  GUARDIAN = "GUARDIAN"
}

export enum BloodGroupTypes {
  A_POSITIVE = "A_POSITIVE",
  A_NEGATIVE = "A_NEGATIVE",
  B_POSITIVE = "B_POSITIVE",
  B_NEGATIVE = "B_NEGATIVE",
  AB_POSITIVE = "AB_POSITIVE",
  AB_NEGATIVE = "AB_NEGATIVE",
  O_POSITIVE = "O_POSITIVE",
  O_NEGATIVE = "O_NEGATIVE"
}

export enum EmploymentAllocationTypes {
  FULL_TIME = "FULL_TIME",
  PART_TIME = "PART_TIME"
}

export enum SystemPermissionTypes {
  EMPLOYEES = "EMPLOYEES",
  MANAGERS = "MANAGERS",
  SUPER_ADMIN = "SUPER_ADMIN",
  LEAVE_MANAGER = "LEAVE_MANAGER",
  ASSET_MANAGER = "ASSET_MANAGER",
  TIME_MANAGER = "TIME_MANAGER",
  PEOPLE_MANAGER = "PEOPLE_MANAGER"
}

export enum EEOJobCategoryTypes {
  EXECUTIVE = "EXECUTIVE_SENIOR_LEVEL_OFFICIALS_AND_MANAGERS",
  FIRST_MID_LEVEL = "FIRST_MID_LEVEL_OFFICIALS_AND_MANAGERS",
  PROFESSIONALS = "PROFESSIONALS",
  TECHNICIANS = "TECHNICIANS",
  SALES_WORKERS = "SALES_WORKERS",
  SUPPORT_WORKERS = "ADMINISTRATIVE_SUPPORT_WORKERS",
  CRAFT_WORKERS = "CRAFT_WORKERS",
  OPERATIVES = "OPERATIVES",
  LABORERS = "LABORERS_AND_HELPERS",
  SERVICE_WORKERS = "SERVICE_WORKERS"
}

export enum EthnicityTypes {
  AFRICAN = "AFRICAN",
  CARIBBEAN = "CARIBBEAN",
  INDIAN = "INDIAN",
  MELANESIAN = "MELANESIAN",
  AUSTRALASIAN_OR_ABORIGINAL = "AUSTRALASIAN_OR_ABORIGINAL",
  CHINESE = "CHINESE",
  GUAMANIAN = "GUAMANIAN",
  JAPANESE = "JAPANESE",
  KOREAN = "KOREAN",
  POLYNESIAN = "POLYNESIAN",
  EUROPEAN_OR_ANGLO_SAXON = "EUROPEAN_OR_ANGLO_SAXON",
  OTHER_PACIFIC_ISLANDER = "OTHER_PACIFIC_ISLANDER",
  LATIN_AMERICAN = "LATIN_AMERICAN",
  ARABIC = "ARABIC",
  VIETNAMESE = "VIETNAMESE",
  MICRONESIAN = "MICRONESIAN",
  DECLINED_TO_RESPOND = "DECLINED_TO_RESPOND",
  OTHER_HISPANIC = "OTHER_HISPANIC",
  US_OR_CANADIAN_INDIAN = "US_OR_CANADIAN_INDIAN",
  OTHER_ASIAN = "OTHER_ASIAN",
  PUERTO_RICAN = "PUERTO_RICAN",
  FILIPINO = "FILIPINO",
  MEXICAN = "MEXICAN",
  ALASKAN_NATIVE = "ALASKAN_NATIVE",
  CUBAN = "CUBAN"
}

export interface ManagerSelectType {
  user: EmployeeDataType;
  fieldName: string;
  formik: FormikProps<EmployeeEmploymentDetailsFormTypes>;
  searchTermSetter: (term: string) => void;
  setSupervisor: (field: string, value: ManagerStoreType) => void;
  setIsPopperOpen: (isOpen: boolean) => void;
}

export interface ManagerSearchType {
  managerType: string;
  e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>;
  setManagerSearchTerm: (searchTerm: string) => void;
  formik: FormikProps<EmployeeEmploymentDetailsFormTypes>;
  setSupervisor: (field: string, value: ManagerStoreType) => void;
}

export interface ManagerRemoveType {
  fieldName: string;
  formik: FormikProps<EmployeeEmploymentDetailsFormTypes>;
  searchTermSetter: (term: string) => void;
  setSupervisor: (field: string, value: ManagerStoreType) => void;
}

export type SystemPermissionInitialStateType = {
  isSuperAdmin: boolean;
  peopleRole: Role;
  leaveRole: Role;
  attendanceRole: Role;
  esignRole: Role;
  pmRole: Role;
  crmRole: Role;
};
