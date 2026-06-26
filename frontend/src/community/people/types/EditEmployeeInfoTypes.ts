// TODO: fix eslint issues
export enum EditEmployeeModalTypes {
  ResourceDetailsModal = "Resource details",
  AddPrimaryManagerModal = "Add primary manager",
  AddSecondaryManagerModal = "Add secondary manager",
  AddToTeamModal = "Add to team",
  ExitConfirmationModalFromManagerModal = "Confirmation to exit from the manager modal",
  ExitConfirmationModalFromEditDetailsModal = "Confirmation to exit from the edit details modal",
  inactiveUser = "Inactivate User",
  reactivateUser = "Reactivate User",
  addLeaveAllocationAndReactivateUser = "Add Leave Allocation And Reactivate User",
  transferTeamLeadPosition = "Transfer Team Lead Position",
  transferSupervisorPosition = "Transfer Supervisor Position",
  transferLeadershipPositions = "Transfer LeaderShip Positions",
  alertPopup = "Alert Popup",
  none = ""
}

export interface DiscardChangeModalType {
  isModalOpen: boolean;
  modalType: string;
  modalOpenedFrom: string;
}

export enum ManagerProfileTabs {
  personal = "Personal",
  employment = "Employment",
  leave = "Leave",
  timesheet = "Timesheet"
}

export enum EditAllInformationType {
  personal = "Personal",
  emergency = "Emergency",
  employment = "Employment",
  permission = "System Permissions",
  timeline = "Timeline",
  leave = "Leave",
  timesheeet = "Timesheet"
}

export enum EditAllInformationFormStatus {
  PENDING = "PENDING",
  TRIGGERED = "TRIGGERED",
  VALIDATED = "VALIDATED",
  VALIDATE_ERROR = "VALIDATE_ERROR",
  UPDATED = "UPDATED",
  UPDATE_ERROR = "UPDATE_ERROR"
}

export interface teamMembers {
  name: string;
  image: string;
}

export interface TeamType {
  id: number;
  name: string;
  members?: teamMembers[];
  inTeam: boolean;
}

export interface ManagerType {
  managerId: string | number;
  name: string;
  avatarUrl: string;
  permission: string;
  isManager: true;
}

export interface EditEmployeeFormikType {
  imageUrl: string;
  firstName: string;
  secondName: string;
  email: string;
  gender: string;
  phone: string;
  countryCode: string;
  address: string;
  country: string;
  employeeId: string;
  workEmail: string;
  permission: string;
  employeeType: string;
  jobRole: string;
  jobLevel: string;
  primaryManager: string;
  secondaryManager: string;
  joinDate: string;
  isProbation: boolean;
  probationStartDate: string;
  probationEndDate: string;
}

export interface EditEmployeePersonalInfoFormikType {
  imageUrl: string;
  firstName: string;
  secondName: string;
  email: string;
  gender: string;
  countryCode: string;
  phone: string;
  address: string;
  country: string;
  employeeId: string;
}

export interface AddedTeamsType {
  name: string;
  teamId: string;
}
export interface SelectedTeamsType {
  teamName: string;
  teamId: string;
}
export interface EditEmployeeProfessionalFormikType {
  employeeId: string;
  workEmail: string;
  permission: string;
  employeeType: string;
  jobRole: string;
  teams: SelectedTeamsType[];
  jobLevel: string;
  primaryManager: string;
  secondaryManager: string;
  joinDate: string;
  isProbation: boolean;
  probationStartDate: string;
  probationEndDate: string;
}

export interface SingleTeamType {
  name: string;
  teamId: string;
}

export interface EditEmployeeModalFormikType {
  status: boolean;
  jobRole: string;
  jobLevel: string;
}

export interface BasicEmployeeDetailsType {
  employeeId: string;
  name: string;
  lastName: string;
  image: string;
}

export interface ToastMessageType {
  type: string;
  title: string;
  message: string;
}
