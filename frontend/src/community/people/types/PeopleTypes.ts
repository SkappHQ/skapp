import { ManagerTypes } from "~community/common/types/CommonTypes";

import {
  AccountStatusTypes,
  BloodGroupTypes,
  EEOJobCategoryTypes,
  EmploymentAllocationTypes,
  EmploymentTypes,
  EthnicityTypes,
  GenderEnum,
  MaritalStatusTypes,
  NationalityEnum,
  RelationshipTypes,
  Role
} from "../enums/PeopleEnums";
import { EmploymentStatusTypes } from "./EmployeeTypes";

//L1 Type
export interface L1EmployeeType {
  personal?: L2PersonalDetailsType;
  emergency?: L2EmergencyDetailsType;
  employment?: L2EmploymentFormDetailsType;
  systemPermissions?: L2SystemPermissionsType;
  common?: L2CommonDetailsType;
}

//L2 Types
export interface L2PersonalDetailsType {
  general?: L3GeneralDetailsType;
  contact?: L3ContactDetailsType;
  family?: L3FamilyDetailsType[];
  educational?: L3EducationalDetailsType[];
  socialMedia?: L3SocialMediaDetailsType;
  healthAndOther?: L3HealthAndOtherDetailsType;
}

export interface L2EmergencyDetailsType {
  primaryEmergencyContact?: L3EmergencyContactType;
  secondaryEmergencyContact?: L3EmergencyContactType;
}

export interface L2EmploymentFormDetailsType {
  employmentDetails?: L3EmploymentDetailsType;
  careerProgression?: L3CareerProgressionDetailsType[];
  identificationAndDiversityDetails?: L3IdentificationAndDiversityDetailsType;
  previousEmployment?: L3PreviousEmploymentDetailsType[];
  visaDetails?: L3VisaDetailsType[];
}

export interface L2SystemPermissionsType {
  isSuperAdmin?: boolean;
  peopleRole?: Role;
  leaveRole?: Role;
  attendanceRole?: Role;
  esignRole?: Role;
  pmRole?: Role;
  invoiceRole?: Role;
}

export interface L2CommonDetailsType {
  employeeId?: string;
  authPic?: string;
  accountStatus?: AccountStatusTypes;
  jobTitle?: string;
}

//L3 Types
export interface L3GeneralDetailsType {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  gender?: GenderEnum;
  dateOfBirth?: string;
  nationality?: NationalityEnum;
  nin?: string;
  passportNumber?: string;
  maritalStatus?: MaritalStatusTypes;
}

export interface L3ContactDetailsType {
  personalEmail?: string;
  countryCode?: string;
  contactNo?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  country?: string;
  state?: string;
  postalCode?: string;
}

export interface L3FamilyDetailsType {
  familyId?: number;
  firstName?: string;
  lastName?: string;
  gender?: GenderEnum;
  relationship?: RelationshipTypes;
  dateOfBirth?: string;
  parentName?: string;
}

export interface L3EducationalDetailsType {
  educationId?: number;
  institutionName?: string;
  degree?: string;
  major?: string;
  startDate?: string;
  endDate?: string;
}

export interface L3SocialMediaDetailsType {
  linkedIn?: string;
  facebook?: string;
  instagram?: string;
  x?: string;
}

export interface L3HealthAndOtherDetailsType {
  bloodGroup?: BloodGroupTypes;
  allergies?: string;
  dietaryRestrictions?: string;
  tShirtSize?: string;
}

export interface L3EmergencyContactType {
  name?: string;
  relationship?: RelationshipTypes;
  countryCode?: string;
  contactNo?: string;
}

export interface L3EmploymentDetailsType {
  employeeNumber?: string;
  email?: string;
  employmentAllocation?: EmploymentAllocationTypes;
  teamIds?: number[];
  primarySupervisor?: L4ManagerType;
  otherSupervisors?: L4ManagerType[];
  joinedDate?: string;
  probationStartDate?: string;
  probationEndDate?: string;
  workTimeZone?: string;
}

export interface L3CareerProgressionDetailsType {
  progressionId?: number;
  employmentType?: EmploymentTypes;
  jobFamilyId?: number;
  jobTitleId?: number;
  startDate?: string;
  endDate?: string;
  isCurrentEmployment?: boolean;
}

export interface L3IdentificationAndDiversityDetailsType {
  ssn?: string;
  ethnicity?: EthnicityTypes;
  eeoJobCategory?: EEOJobCategoryTypes;
}

export interface L3PreviousEmploymentDetailsType {
  employmentId?: number;
  companyName?: string;
  jobTitle?: string;
  startDate?: string;
  endDate?: string;
}

export interface L3VisaDetailsType {
  visaId?: number;
  visaType?: string;
  issuingCountry?: string;
  issuedDate?: string;
  expiryDate?: string;
}

//L4 Types
export interface L4ManagerType {
  employeeId?: number;
  firstName?: string;
  lastName?: string;
  authPic?: string;
}

export interface checkOverlapType {
  positions: L3CareerProgressionDetailsType[];
  newStartDate: number;
  newEndDate: number | null;
  newCurrentPosition: boolean;
}

export interface tenureType {
  startDate: string;
  endDate?: string;
  currentPosition?: boolean;
}

export interface EntitlementDetailType {
  year: string;
  leaveType: string;
  leaveName: string;
  numDays: string;
  effectiveFrom: string;
  expirationDate: string;
}

export interface EmployeeDataManagerType {
  employeeId?: number;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  authPic?: string;
  isPrimaryManager?: boolean;
  managerType?: ManagerTypes;
}

export interface EmployeeDataTeamType {
  teamId: number;
  teamName: string;
}

export interface AllEmployeeDataType {
  employeeId: number;
  firstName: string;
  lastName: string;
  authPic?: string;
  email?: string;
  jobFamily?: string;
  jobTitle?: string;
  isActive?: boolean;
  accountStatus?: EmploymentStatusTypes;
  managers?: EmployeeDataManagerType[];
  teams?: EmployeeDataTeamType[];
}

export interface AllEmployeeDataResponse {
  items: AllEmployeeDataType[];
  totalPages?: number;
  currentPage?: number;
  totalItems?: number;
  pages?: any;
}
