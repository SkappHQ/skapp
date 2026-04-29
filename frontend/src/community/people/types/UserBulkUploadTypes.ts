export enum UserBulkUploadModelTypes {
  DOWNLOAD_CSV = "DOWNLOAD_CSV",
  UPLOAD_CSV = "UPLOAD_CSV",
  INVITE_MEMBERS = "INVITE_MEMBERS",
  UPLOAD_SUMMARY = "UPLOAD_SUMMARY",
  NONE = "NONE",
  UPLOAD_TYPE_SELECT = "UPLOAD_TYPE_SELECT"
}

export interface BulkUploadUser {
  firstName: string | null;
  lastName: string | null;
  middleName: string | null;
  gender: string | null;
  birthDate: string | null;
  nationality: string | null;
  nin: string | null;
  maritalStatus: string | null;
  personalEmail: string | null;
  phoneDialCode: string | null;
  phone: string | null;
  address: string | null;
  addressLine2: string | null;
  city: string | null;
  country: string | null;
  state: string | null;
  postalCode: string | null;
  linkedIn: string | null;
  facebook: string | null;
  instagram: string | null;
  x: string | null;
  bloodGroup: string | null;
  allergies: string | null;
  dietaryRestrictions: string | null;
  tshirtSize: string | null;
  name: string | null;
  emergencyRelationship: string | null;
  contactNoDialCode: string | null;
  contactNo: string | null;
  identificationNo: string | null;
  workEmail: string | null;
  employmentAllocation: string | null;
  joinedDate: string | null;
  teams: string | number[];
  primaryManager: string | null;
  startDate: string | null;
  endDate: string | null;
  timeZone: string | null;
  employeeType: string | null;
  jobFamilyId: number | string | null;
  jobTitleId: number | string | null;
  ssn: string | null;
  ethnicity: string | null;
  eeo: string | null;
  employeeId?: number | string | null;
  permission: string | null;
  contractState: string | null;
  employmentStatus: string | null;
  passportNo: string | null;
}

export interface bulkUploadResponce {
  email: string;
  status: string;
}
