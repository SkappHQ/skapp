import { FileUploadType } from "~community/common/types/CommonTypes";

import { Store } from "./StoreTypes";

export interface AddCalenderInputType {
  acceptedFile: FileUploadType[];
}

export interface TeamSliceType
  extends Pick<
    Store,
    | "isTeamModalOpen"
    | "teamModalType"
    | "setIsTeamModalOpen"
    | "setTeamModalType"
    | "currentEditingTeam"
    | "setCurrentEditingTeam"
    | "currentDeletingTeam"
    | "setCurrentDeletingTeam"
  > {}

export interface EmployeeDataFiltersSliceType
  extends Pick<
    Store,
    | "employeeDataFilter"
    | "employeeDataFilterOrder"
    | "employeeDataParams"
    | "selectedEmployees"
    | "setSelectedEmployees"
    | "menuItems"
    | "searchedItems"
    | "handleEmployeeDataSort"
    | "setEmployeeDataFilter"
    | "resetEmployeeDataParams"
    | "setEmployeeDataParams"
    | "setEmployeeDataPagination"
    | "setEmployeeDataFilterOrder"
    | "setMenuItems"
    | "setSearchedItems"
    | "setEmployeeStatusParam"
    | "setIsEmployeePending"
    | "setSearchKeyword"
    | "setIsPendingInvitationListOpen"
    | "isPendingInvitationListOpen"
    | "removeEmployeeFilter"
    | "removeGenderFilter"
  > {}

export interface DirectoryModalSliceType
  extends Pick<
    Store,
    | "isDirectoryModalOpen"
    | "directoryModalType"
    | "bulkUploadUsers"
    | "setIsDirectoryModalOpen"
    | "setDirectoryModalType"
    | "setBulkUploadUsers"
    | "sharedCredentialData"
    | "setSharedCredentialData"
    | "pendingAddResourceData"
    | "setPendingAddResourceData"
  > {}

export interface AddNewResourceSliceTypes
  extends Pick<
    Store,
    | "employeeGeneralDetails"
    | "employeeContactDetails"
    | "employeeFamilyDetails"
    | "employeeEducationalDetails"
    | "employeeSocialMediaDetails"
    | "employeeHealthAndOtherDetails"
    | "employeeEmergencyContactDetails"
    | "employeeEmploymentDetails"
    | "employeeCareerDetails"
    | "employeeIdentificationAndDiversityDetails"
    | "employeePreviousEmploymentDetails"
    | "employeeVisaDetails"
    | "employeeEntitlementsDetails"
    | "employeeDataChanges"
    | "employeeProfileDetails"
    | "setEmployeeGeneralDetails"
    | "setEmployeeContactDetails"
    | "setEmployeeFamilyDetails"
    | "setEmployeeEducationalDetails"
    | "setEmployeeSocialMediaDetails"
    | "setEmployeeHealthAndOtherDetails"
    | "setEmployeePrimaryEmergencyContactDetails"
    | "setEmployeeSecondaryEmergencyContactDetails"
    | "setEmployeeEmploymentDetails"
    | "setEmployeeCareerDetails"
    | "setEmployeeIdentificationAndDiversityDetails"
    | "setEmployeePreviousEmploymentDetails"
    | "setEmployeeVisaDetails"
    | "setEmployeeEntitlementsDetails"
    | "resetEmployeeDataChanges"
    | "setEmployeeProfileDetails"
    | "reinitializeFormik"
    | "resetEmployeeData"
    | "userRoles"
    | "setUserRoles"
    | "isFromPeopleDirectory"
    | "viewEmployeeId"
    | "setIsFromPeopleDirectory"
    | "setViewEmployeeId"
    | "setIsLeaveTabVisible"
    | "isLeaveTabVisible"
    | "setIsTimeTabVisible"
    | "isTimeTabVisible"
    | "isReinviteConfirmationModalOpen"
    | "setIsReinviteConfirmationModalOpen"
  > {}

export interface ProjectTeamModalSliceType
  extends Pick<
    Store,
    | "isProjectTeamsModalOpen"
    | "projectTeamModalType"
    | "setProjectTeamsModalOpen"
    | "setProjectTeamModalType"
  > {}

export interface ProjectTeamSearchSliceType
  extends Pick<
    Store,
    | "projectTeamSearchTerm"
    | "projectTeamNames"
    | "projectTeams"
    | "projectTeamsAndEmployees"
    | "addedTeams"
    | "setProjectTeamSearchTerm"
    | "setProjectTeams"
    | "setProjectTeamNames"
    | "setProjectTeamsAndEmployees"
    | "setAddedTeams"
  > {}

export interface JobFamilySliceType
  extends Pick<
    Store,
    | "allJobFamilies"
    | "isJobFamilyModalOpen"
    | "jobFamilyModalType"
    | "currentEditingJobFamily"
    | "currentDeletingJobFamily"
    | "previousJobTitleData"
    | "currentTransferMembersData"
    | "setAllJobFamilies"
    | "setIsJobFamilyModalOpen"
    | "setJobFamilyModalType"
    | "setCurrentEditingJobFamily"
    | "setCurrentDeletingJobFamily"
    | "setPreviousJobTitleData"
    | "setCurrentTransferMembersData"
  > {}

export interface CalendarSliceTypes
  extends Pick<
    Store,
    | "isNewCalendarDetailsValid"
    | "setIsNewCalendarDetailsValid"
    | "newCalenderDetails"
    | "setNewCalendarDetails"
    | "calendarErrors"
    | "setCalendarErrors"
    | "removeAddedCalendarDetails"
  > {}

export interface HolidaySliceTypes
  extends Pick<
    Store,
    | "newHolidayDetails"
    | "setHolidayDetails"
    | "resetHolidayDetails"
    | "failedCount"
    | "setFailedCount"
    | "resetFailedCount"
    | "successCount"
    | "setSuccessCount"
    | "resetSuccessCount"
    | "isBulkUpload"
    | "setIsBulkUpload"
  > {}

export interface HolidayDataFiltersSliceTypes
  extends Pick<
    Store,
    | "holidayDataFilter"
    | "holidayDataParams"
    | "individualDeleteId"
    | "selectedDeleteIds"
    | "handleHolidayDataSort"
    | "setHolidayDataFilter"
    | "resetHolidayDataParams"
    | "setHolidayDataParams"
    | "setHolidayDataPagination"
    | "setIndividualDeleteId"
    | "setSelectedDeleteIds"
    | "selectedYear"
    | "setSelectedYear"
  > {}

export interface HolidayModalSliceType
  extends Pick<
    Store,
    | "isHolidayModalOpen"
    | "holidayModalType"
    | "setIsHolidayModalOpen"
    | "setHolidayModalType"
  > {}

export interface PeopleSliceTypes
  extends Pick<
    Store,
    | "employee"
    | "initialEmployee"
    | "nextStep"
    | "currentStep"
    | "activeStep"
    | "profilePic"
    | "setProfilePic"
    | "thumbnail"
    | "setThumbnail"
    | "setActiveStep"
    | "isUnsavedChangesModalOpen"
    | "isUnsavedModalSaveButtonClicked"
    | "isUnsavedModalDiscardButtonClicked"
    | "setNextStep"
    | "setCurrentStep"
    | "setIsUnsavedChangesModalOpen"
    | "setIsUnsavedModalSaveButtonClicked"
    | "setIsUnsavedModalDiscardButtonClicked"
    | "setEmployee"
    | "setPersonalDetails"
    | "setEmergencyDetails"
    | "setEmploymentDetails"
    | "setSystemPermissions"
    | "setCommonDetails"
    | "resetPeopleSlice"
    | "entitlementDetails"
    | "setEntitlementDetails"
    | "isCancelChangesModalOpen"
    | "isCancelModalConfirmButtonClicked"
    | "setIsCancelChangesModalOpen"
    | "setIsCancelModalConfirmButtonClicked"
    | "superAdminCount"
    | "setSuperAdminCount"
  > {}
