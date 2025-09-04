import { SetType } from "~community/common/types/CommonTypes";
import { Role } from "~community/people/enums/PeopleEnums";
import { ModifiedFileType } from "~community/people/types/AddNewResourceTypes";
import { EditPeopleFormTypes } from "~community/people/types/PeopleEditTypes";
import {
  EntitlementDetailType,
  L1EmployeeType,
  L2CommonDetailsType,
  L2EmergencyDetailsType,
  L2EmploymentFormDetailsType,
  L2PersonalDetailsType,
  L2SystemPermissionsType
} from "~community/people/types/PeopleTypes";
import { PeopleSliceTypes } from "~community/people/types/SliceTypes";

const defaultEmployee: L1EmployeeType = {
  personal: {
    general: {
      firstName: "",
      middleName: "",
      lastName: "",
      gender: undefined,
      dateOfBirth: undefined,
      nationality: undefined,
      nin: "",
      passportNumber: "",
      maritalStatus: undefined
    },
    contact: {
      personalEmail: "",
      countryCode: "",
      contactNo: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      country: "",
      state: "",
      postalCode: ""
    },
    family: [],
    educational: [],
    socialMedia: {
      linkedIn: "",
      facebook: "",
      instagram: "",
      x: ""
    },
    healthAndOther: {
      bloodGroup: undefined,
      allergies: "",
      dietaryRestrictions: "",
      tShirtSize: ""
    }
  },
  emergency: {
    primaryEmergencyContact: {
      name: "",
      relationship: undefined,
      countryCode: undefined,
      contactNo: ""
    },
    secondaryEmergencyContact: {
      name: "",
      relationship: undefined,
      countryCode: undefined,
      contactNo: ""
    }
  },
  employment: {
    employmentDetails: {
      employeeNumber: "",
      email: "",
      employmentAllocation: undefined,
      teamIds: undefined,
      primarySupervisor: undefined,
      otherSupervisors: [],
      joinedDate: undefined,
      probationStartDate: undefined,
      probationEndDate: undefined,
      workTimeZone: undefined
    },
    careerProgression: [],
    identificationAndDiversityDetails: {
      ssn: "",
      ethnicity: undefined,
      eeoJobCategory: undefined
    },
    previousEmployment: [],
    visaDetails: []
  },
  systemPermissions: {
    isSuperAdmin: false,
    peopleRole: Role.PEOPLE_EMPLOYEE,
    leaveRole: Role.LEAVE_EMPLOYEE,
    attendanceRole: Role.ATTENDANCE_EMPLOYEE,
    esignRole: Role.ESIGN_EMPLOYEE,
    pmRole: Role.PM_EMPLOYEE,
    invoiceRole: Role.INVOICE_NONE
  },
  common: {
    employeeId: "",
    authPic: "",
    accountStatus: undefined,
    jobTitle: ""
  }
};

const entitlementDetails: EntitlementDetailType[] = [];

const peopleSlice = (set: SetType<PeopleSliceTypes>): PeopleSliceTypes => ({
  employee: defaultEmployee,
  initialEmployee: defaultEmployee,
  nextStep: EditPeopleFormTypes.personal,
  currentStep: EditPeopleFormTypes.personal,
  activeStep: 0,
  isUnsavedChangesModalOpen: false,
  isUnsavedModalSaveButtonClicked: false,
  isUnsavedModalDiscardButtonClicked: false,
  profilePic: null,
  entitlementDetails: entitlementDetails,
  isCancelChangesModalOpen: false,
  isCancelModalConfirmButtonClicked: false,
  superAdminCount: 0,
  setProfilePic: (profilePic: ModifiedFileType[] | null) =>
    set(() => ({ profilePic })),
  thumbnail: null,
  setThumbnail: (thumbnail: ModifiedFileType[] | null) =>
    set(() => ({ thumbnail })),
  setActiveStep: (activeStep: number) => set(() => ({ activeStep })),
  setNextStep: (nextStep: EditPeopleFormTypes) => set(() => ({ nextStep })),
  setCurrentStep: (currentStep: EditPeopleFormTypes) =>
    set(() => ({ currentStep })),
  setIsUnsavedChangesModalOpen: (isUnsavedChangesModalOpen: boolean) =>
    set(() => ({ isUnsavedChangesModalOpen })),
  setIsUnsavedModalSaveButtonClicked: (
    isUnsavedModalSaveButtonClicked: boolean
  ) => set(() => ({ isUnsavedModalSaveButtonClicked })),
  setIsUnsavedModalDiscardButtonClicked: (
    isUnsavedModalDiscardButtonClicked: boolean
  ) => set(() => ({ isUnsavedModalDiscardButtonClicked })),
  setEmployee: (employee: L1EmployeeType) =>
    set(() => ({ employee, initialEmployee: employee })),
  setPersonalDetails: (personal: L2PersonalDetailsType) =>
    set((state: PeopleSliceTypes) => ({
      ...state,
      employee: {
        ...state.employee,
        personal: { ...state.employee.personal, ...personal }
      }
    })),
  setEmergencyDetails: (emergency: L2EmergencyDetailsType) =>
    set((state: PeopleSliceTypes) => ({
      ...state,
      employee: {
        ...state.employee,
        emergency: { ...state.employee.emergency, ...emergency }
      }
    })),
  setEmploymentDetails: (employment: L2EmploymentFormDetailsType) =>
    set((state: PeopleSliceTypes) => ({
      ...state,
      employee: {
        ...state.employee,
        employment: { ...state.employee.employment, ...employment }
      }
    })),
  setSystemPermissions: (systemPermissions: L2SystemPermissionsType) =>
    set((state: PeopleSliceTypes) => ({
      ...state,
      employee: {
        ...state.employee,
        systemPermissions: {
          ...state.employee.systemPermissions,
          ...systemPermissions
        }
      }
    })),
  setCommonDetails: (common: L2CommonDetailsType) =>
    set((state: PeopleSliceTypes) => ({
      ...state,
      employee: {
        ...state.employee,
        common: { ...state.employee.common, ...common }
      }
    })),
  setEntitlementDetails: (value: EntitlementDetailType[]) => {
    set((state) => ({
      ...state,
      entitlementDetails: value
    }));
  },
  setIsCancelChangesModalOpen: (isCancelChangesModalOpen: boolean) =>
    set(() => ({ isCancelChangesModalOpen })),
  setIsCancelModalConfirmButtonClicked: (
    isCancelModalConfirmButtonClicked: boolean
  ) => set(() => ({ isCancelModalConfirmButtonClicked })),
  setSuperAdminCount: (superAdminCount: number) =>
    set(() => ({ superAdminCount })),
  resetPeopleSlice: () =>
    set(() => ({
      employee: defaultEmployee,
      initialEmployee: defaultEmployee,
      nextStep: EditPeopleFormTypes.personal,
      currentStep: EditPeopleFormTypes.personal,
      activeStep: 0,
      isUnsavedChangesModalOpen: false,
      isUnsavedModalSaveButtonClicked: false,
      isUnsavedModalDiscardButtonClicked: false,
      profilePic: null,
      thumbnail: null,
      entitlementDetails: entitlementDetails,
      isCancelChangesModalOpen: false,
      isCancelModalConfirmButtonClicked: false,
      superAdminCount: 0
    }))
});

export default peopleSlice;
