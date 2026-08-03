import { BirthdayModalVariant } from "~community/people/enums/BirthdayNotificationEnums";

export type EmployeeIdType = number | string | null | undefined;

export interface EmployeeBirthdayType {
  employeeId: number;
  firstName: string;
  lastName: string;
  authPic: string | null;
  email: string;
}

export interface BirthdayNotificationPayloadType {
  lastViewedDate: string | null;
  employeeBirthdays: EmployeeBirthdayType[];
}

export interface PartitionedBirthdaysType {
  self: EmployeeBirthdayType | null;
  colleagues: EmployeeBirthdayType[];
}

export interface BirthdayQueueEntryType {
  variant: BirthdayModalVariant;
  employee: EmployeeBirthdayType;
}
