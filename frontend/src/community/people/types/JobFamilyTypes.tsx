export interface JobTitleType {
  jobTitleId: number | null;
  name: string;
}

export interface JobFamilyEmployeeDataType {
  employeeId: number;
  firstName?: string;
  lastName: string;
  avatarUrl?: string;
  authPic?: string;
  jobFamily?: string;
  jobTitle?: JobTitleType;
}

export interface AllJobFamilyType {
  jobFamilyId: number;
  name: string;
  jobTitles: Array<JobTitleType>;
  employees: JobFamilyEmployeeDataType[];
}

export interface CurrentEditingJobFamilyType {
  jobFamilyId: number;
  name: string;
  jobTitles: Array<JobTitleType>;
}

export interface DeletingJobFamily {
  jobFamilyId: number;
  employees: JobFamilyEmployeeDataType[];
}

export interface AddJobFamilyFormType {
  jobFamilyId: number;
  name: string;
  jobTitleInput: string;
  jobTitles: Array<JobTitleType>;
}

export interface AddJobFamilyMutationType {
  name: string;
  titles: Array<string>;
}

export interface EditJobFamilyMutationType {
  jobFamilyId: number;
  name: string;
  titles: Array<JobTitleType>;
}

export interface TransferMembersWithJobFamilyPayloadType {
  employeeId: number;
  jobFamilyId: number;
  jobTitleId: number;
}

export interface TransferMembersWithJobFamilyMutationType {
  jobFamilyId: number;
  payload: Array<TransferMembersWithJobFamilyPayloadType>;
}

export interface TransferMembersWithJobTitlePayloadType {
  employeeId: number;
  jobTitleId: number;
}

export interface TransferMembersWithJobTitleMutationType {
  jobTitleId: number;
  payload: Array<TransferMembersWithJobTitlePayloadType>;
}

export interface TransferMemberFormType {
  employeeId?: number;
  jobFamily: JobFamilyDropDownType | null;
  jobTitle: JobTitleType | null;
}

export interface JobFamilyDropDownType {
  jobFamilyId: number;
  name: string;
}
