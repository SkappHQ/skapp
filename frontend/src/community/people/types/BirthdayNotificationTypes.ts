import { BirthdayModalVariant } from "~community/people/enums/BirthdayNotificationEnums";

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

export interface BirthdayNotificationTodayResponse {
  results: BirthdayNotificationPayloadType[];
}

export interface MarkBirthdayNotificationsViewedResult {
  lastViewedDate: string | null;
}

export interface MarkBirthdayNotificationsViewedResponse {
  results: MarkBirthdayNotificationsViewedResult[];
}

export interface PartitionedBirthdaysType {
  self: EmployeeBirthdayType | null;
  colleagues: EmployeeBirthdayType[];
}

export interface BirthdayQueueEntryType {
  variant: BirthdayModalVariant;
  employee: EmployeeBirthdayType;
}

export interface BirthdayNotificationViewStateType {
  userId: number;
  lastViewedDate: string;
}

export interface BirthdayDismissedCacheType {
  userId: number;
  date: string;
  dismissedEmployeeIds: number[];
}

export interface BirthdayNotificationContextType {
  isEligible: boolean;
  today: string;
  evaluationTick: number;
  isViewedToday: boolean;
  cacheLastViewedDate: (lastViewedDate: string) => void;
}

export interface BirthdayNotificationsType {
  currentEntry: BirthdayQueueEntryType | null;
  position: number;
  total: number;
  onDismiss: () => void;
}
