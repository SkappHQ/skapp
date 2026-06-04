import { SetType } from "~community/common/types/storeTypes";
import {
  type EducationalDetailsType,
  type EmployeeCareerDetailsTypes,
  type EmployeeContactDetailsTypes,
  type EmployeeEducationalDetailsTypes,
  type EmployeeEmergencyDetailsTypes,
  type EmployeeEmploymentDetailsTypes,
  type EmployeeEntitlementsDetailType,
  type EmployeeFamilyDetailsTypes,
  type EmployeeGeneralDetailsTypes,
  type EmployeeHealthAndOtherDetailsTypes,
  type EmployeeIdentificationAndDiversityDetailsTypes,
  type EmployeePreviousEmploymentDetailsTypes,
  type EmployeeProfileDetailsTypes,
  type EmployeeSocialMediaDetailsTypes,
  type EmployeeVisaDetailsTypes,
  type FamilyMemberType,
  ManagerStoreType,
  ModifiedFileType,
  type PositionDetailsType,
  type PreviousEmploymentDetailsType,
  SystemPermissionTypes,
  type VisaDetailsType
} from "~community/people/types/AddNewResourceTypes";
import { EmployeeRoleType, Role } from "~community/people/types/EmployeeTypes";
import { AddNewResourceSliceTypes } from "~community/people/types/SliceTypes";

const employeeGeneralDetails: EmployeeGeneralDetailsTypes = {
  authPic: [],
  thumbnail: [],
  title: "",
  firstName: "",
  middleName: "",
  lastName: "",
  gender: "",
  birthDate: "",
  nationality: "",
  nin: "",
  passportNumber: "",
  maritalStatus: ""
};
const employeeContactDetails: EmployeeContactDetailsTypes = {
  personalEmail: "",
  countryCode: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  country: "",
  state: "",
  postalCode: ""
};
const employeeFamilyDetails: EmployeeFamilyDetailsTypes = {
  familyMembers: []
};
const employeeEducationalDetails: EmployeeEducationalDetailsTypes = {
  educationalDetails: []
};
const employeeSocialMediaDetails: EmployeeSocialMediaDetailsTypes = {
  linkedIn: "",
  facebook: "",
  instagram: "",
  x: ""
};
const employeeHealthAndOtherDetails: EmployeeHealthAndOtherDetailsTypes = {
  bloodGroup: "",
  allergies: "",
  dietaryRestrictions: "",
  tshirtSize: ""
};
const employeeEmergencyContactDetails: EmployeeEmergencyDetailsTypes = {
  primaryEmergencyContact: {
    name: "",
    relationship: "",
    countryCode: "",
    phone: ""
  },
  secondaryEmergencyContact: {
    name: "",
    relationship: "",
    countryCode: "",
    phone: ""
  }
};
const employeeEmploymentDetails: EmployeeEmploymentDetailsTypes = {
  employeeNumber: "",
  workEmail: "",
  employmentAllocation: "",
  systemPermission: SystemPermissionTypes.EMPLOYEES,
  teams: [],
  primarySupervisor: {
    employeeId: undefined,
    firstName: "",
    lastName: "",
    avatarUrl: ""
  },
  secondarySupervisor: {
    employeeId: undefined,
    firstName: "",
    lastName: "",
    avatarUrl: ""
  },
  joinedDate: "",
  probationStartDate: "",
  probationEndDate: "",
  workTimeZone: "",
  workLocationId: undefined
};
const employeeCareerDetails: EmployeeCareerDetailsTypes = {
  positionDetails: []
};
const employeeIdentificationAndDiversityDetails: EmployeeIdentificationAndDiversityDetailsTypes =
  {
    ssn: "",
    ethnicity: "",
    eeoJobCategory: ""
  };
const employeePreviousEmploymentDetails: EmployeePreviousEmploymentDetailsTypes =
  {
    previousEmploymentDetails: []
  };
const employeeVisaDetails: EmployeeVisaDetailsTypes = {
  visaDetails: []
};
const employeeEntitlementsDetails: EmployeeEntitlementsDetailType[] = [];

const employeeDataChanges: number = 0;

const employeeProfileDetails: EmployeeProfileDetailsTypes = {
  teams: [],
  careerDetails: []
};

const userRoles: EmployeeRoleType = {
  isSuperAdmin: false,
  attendanceRole: Role.ATTENDANCE_EMPLOYEE,
  peopleRole: Role.PEOPLE_EMPLOYEE,
  leaveRole: Role.LEAVE_EMPLOYEE,
  esignRole: Role.ESIGN_EMPLOYEE,
  pmRole: Role.PM_EMPLOYEE,
  crmRole: Role.CRM_NONE
};

export const employeeDetailsSlice = (
  set: SetType<AddNewResourceSliceTypes>
): AddNewResourceSliceTypes => ({
  employeeGeneralDetails,
  employeeContactDetails,
  employeeFamilyDetails,
  employeeEducationalDetails,
  employeeSocialMediaDetails,
  employeeHealthAndOtherDetails,
  employeeEmergencyContactDetails,
  employeeEmploymentDetails,
  employeeCareerDetails,
  employeeIdentificationAndDiversityDetails,
  employeePreviousEmploymentDetails,
  employeeVisaDetails,
  employeeEntitlementsDetails,
  employeeDataChanges,
  employeeProfileDetails,
  userRoles,
  isFromPeopleDirectory: false,
  isLeaveTabVisible: false,
  viewEmployeeId: null,
  isTimeTabVisible: false,
  isReinviteConfirmationModalOpen: false,

  setIsReinviteConfirmationModalOpen: (value: boolean) =>
    set((state) => ({
      ...state,
      isReinviteConfirmationModalOpen: value
    })),
  setEmployeeGeneralDetails: (
    key: string,
    value:
      | string
      | ModifiedFileType[]
      | number
      | null
      | undefined
      | (File & {
          preview: string;
        })[]
  ) =>
    set((state) => ({
      ...state,
      employeeGeneralDetails: { ...state.employeeGeneralDetails, [key]: value }
    })),
  setEmployeeContactDetails: (
    key: string,
    value: string | number | null | undefined
  ) =>
    set((state) => ({
      ...state,
      employeeContactDetails: { ...state.employeeContactDetails, [key]: value }
    })),
  setEmployeeFamilyDetails: (value: FamilyMemberType | FamilyMemberType[]) =>
    set((state) => ({
      ...state,
      employeeFamilyDetails: {
        ...state.employeeFamilyDetails,
        familyMembers: Array.isArray(value)
          ? value
          : [...state.employeeFamilyDetails.familyMembers, value]
      }
    })),
  setEmployeeEducationalDetails: (
    value: EducationalDetailsType | EducationalDetailsType[]
  ) =>
    set((state) => ({
      ...state,
      employeeEducationalDetails: {
        ...state.employeeEducationalDetails,
        educationalDetails: Array.isArray(value)
          ? value
          : [...state.employeeEducationalDetails.educationalDetails, value]
      }
    })),
  setEmployeeSocialMediaDetails: (
    key: string,
    value: string | null | undefined
  ) =>
    set((state) => ({
      ...state,
      employeeSocialMediaDetails: {
        ...state.employeeSocialMediaDetails,
        [key]: value
      }
    })),
  setEmployeeHealthAndOtherDetails: (
    key: string,
    value: string | null | undefined
  ) =>
    set((state) => ({
      ...state,
      employeeHealthAndOtherDetails: {
        ...state.employeeHealthAndOtherDetails,
        [key]: value
      }
    })),
  setEmployeePrimaryEmergencyContactDetails: (
    key: string,
    value: string | number
  ) =>
    set((state) => ({
      ...state,
      employeeEmergencyContactDetails: {
        ...state.employeeEmergencyContactDetails,
        primaryEmergencyContact: {
          ...state.employeeEmergencyContactDetails.primaryEmergencyContact,
          [key]: value
        }
      }
    })),
  setEmployeeSecondaryEmergencyContactDetails: (
    key: string,
    value: string | number
  ) =>
    set((state) => ({
      ...state,
      employeeEmergencyContactDetails: {
        ...state.employeeEmergencyContactDetails,
        secondaryEmergencyContact: {
          ...state.employeeEmergencyContactDetails.secondaryEmergencyContact,
          [key]: value
        }
      }
    })),
  setEmployeeEmploymentDetails: (
    key: string,
    value:
      | string
      | ManagerStoreType
      | (string | number)[]
      | number
      | null
      | undefined
  ) =>
    set((state) => ({
      ...state,
      employeeEmploymentDetails: {
        ...state.employeeEmploymentDetails,
        [key]: value
      }
    })),
  setEmployeeCareerDetails: (
    value: PositionDetailsType | PositionDetailsType[]
  ) =>
    set((state) => ({
      ...state,
      employeeCareerDetails: {
        ...state.employeeCareerDetails,
        positionDetails: Array.isArray(value)
          ? value
          : [...state.employeeCareerDetails.positionDetails, value]
      }
    })),
  setEmployeeIdentificationAndDiversityDetails: (key: string, value: string) =>
    set((state) => ({
      ...state,
      employeeIdentificationAndDiversityDetails: {
        ...state.employeeIdentificationAndDiversityDetails,
        [key]: value
      }
    })),
  setEmployeePreviousEmploymentDetails: (
    value: PreviousEmploymentDetailsType | PreviousEmploymentDetailsType[]
  ) =>
    set((state) => ({
      ...state,
      employeePreviousEmploymentDetails: {
        ...state.employeePreviousEmploymentDetails,
        previousEmploymentDetails: Array.isArray(value)
          ? value
          : [
              ...state.employeePreviousEmploymentDetails
                .previousEmploymentDetails,
              value
            ]
      }
    })),
  setEmployeeVisaDetails: (value: VisaDetailsType | VisaDetailsType[]) =>
    set((state) => ({
      ...state,
      employeeVisaDetails: {
        ...state.employeeVisaDetails,
        visaDetails: Array.isArray(value)
          ? value
          : [...state.employeeVisaDetails.visaDetails, value]
      }
    })),
  setEmployeeEntitlementsDetails: (value: EmployeeEntitlementsDetailType[]) => {
    set((state) => ({
      ...state,
      employeeEntitlementsDetails: value
    }));
  },
  setEmployeeProfileDetails: (
    key: string,
    value: string | string[] | PositionDetailsType
  ) =>
    set((state) => ({
      ...state,
      employeeProfileDetails: {
        ...state.employeeProfileDetails,
        [key]: value
      }
    })),
  reinitializeFormik: () =>
    set((state) => ({
      ...state,
      employeeDataChanges: state.employeeDataChanges + 1
    })),
  resetEmployeeDataChanges: () =>
    set((state) => ({
      ...state,
      employeeDataChanges: 0
    })),
  resetEmployeeData: () =>
    set((state) => ({
      ...state,
      employeeGeneralDetails,
      employeeContactDetails,
      employeeFamilyDetails,
      employeeEducationalDetails,
      employeeSocialMediaDetails,
      employeeHealthAndOtherDetails,
      employeeEmergencyContactDetails,
      employeeEmploymentDetails,
      employeeCareerDetails,
      employeeIdentificationAndDiversityDetails,
      employeePreviousEmploymentDetails,
      employeeVisaDetails,
      employeeEntitlementsDetails,
      employeeDataChanges,
      userRoles
    })),
  setUserRoles: (key: keyof EmployeeRoleType, value: Role | boolean) =>
    set((state) => ({
      ...state,
      userRoles: { ...state.userRoles, [key]: value }
    })),
  setIsFromPeopleDirectory: (value: boolean) =>
    set((state) => ({
      ...state,
      isFromPeopleDirectory: value
    })),
  setViewEmployeeId: (value: number) =>
    set((state) => ({
      ...state,
      viewEmployeeId: value
    })),
  setIsLeaveTabVisible: (value: boolean) =>
    set((state) => ({
      ...state,
      isLeaveTabVisible: value
    })),
  setIsTimeTabVisible: (value: boolean) =>
    set((state) => ({
      ...state,
      isTimeTabVisible: value
    }))
});
