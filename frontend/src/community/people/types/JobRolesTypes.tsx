export interface Employee {
  employeeId: string;
  name: string | null;
  lastName: string | null;
  designation: string | null;
  authPic: string | null;
  identificationNo: string | null | number | null;
  permission: string | null;
  email: string | null;
}

export type JobFamilyType = {
  jobFamilyId: number;
  name: string;
  jobTitles: Array<{ jobTitleId: number; name: string }>;
  employees: Employee[];
};

export enum JobRolesModalTypes {
  ADD_JOB_ROLES = "Add Team",
  ADD_JOB_ROLES_QUICK_WIZARD = "Add Team Quick Wizard",
  EDIT_JOB_ROLES = "Edit Team",
  CONFIRM_DELETION_ROLE = "Delete Job Department",
  CONFIRM_DELETION_LEVEL = "Delete Job Role",
  TRANSFER_MEMBERS_ROLE = "Transfer Members Department",
  TRANSFER_MEMBERS_LEVEL = "Transfer Members Role",
  CONFIRM_EDIT_LEVEL = "Edit Role",
  CONFIRM_EXIT = "Exit",
  TRANSFER_SUCCESS = "Transfer success"
}

export interface JobRoles {
  jobRoleId: number;
  name: string;
  jobLevels: JobLevel[] | [];
}

export interface JobLevel {
  jobLevelId: number;
  name: string;
}

export interface JobFilterRoles {
  id: number;
  text: string;
  jobLevels: JobLevel[] | [];
}

export interface JobFamilies {
  jobFamilyId: number;
  name: string;
  jobTitles: JobTitles[] | [];
}

export interface JobTitles {
  jobTitleId: number;
  name: string;
}

export type JobFamiliesType = {
  jobFamilyId: number;
  name: string;
  jobTitles: Array<{ jobTitleId: number; name: string }>;
  employees: Employee[];
};
