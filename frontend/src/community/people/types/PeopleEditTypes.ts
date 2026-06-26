export enum EditPeopleFormTypes {
  personal = "Personal",
  emergency = "Emergency",
  employment = "Employment",
  permission = "System Permissions",
  timeline = "Timeline",
  leave = "Leave",
  timesheet = "Timesheet",
  documents = "Documents"
}

export enum EditPeopleFormStatus {
  PENDING = "PENDING",
  TRIGGERED = "TRIGGERED",
  VALIDATED = "VALIDATED",
  VALIDATE_ERROR = "VALIDATE_ERROR",
  UPDATED = "UPDATED",
  UPDATE_ERROR = "UPDATE_ERROR"
}

export interface FormMethods {
  validateForm: () => Promise<Record<string, string>>;
  submitForm: () => void;
  resetForm: () => void;
  setFieldError?: (field: string, error: string) => void;
}
