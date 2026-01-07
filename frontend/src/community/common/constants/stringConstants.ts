export enum characterLengths {
  JOB_FAMILY_LENGTH = 50,
  JOB_TITLE_LENGTH = 50,
  NAME_LENGTH = 50,
  CHARACTER_LENGTH = 50,
  COMPANY_NAME_LENGTH = 30,
  ORGANIZATION_NAME_LENGTH = 100,
  EMPLOYEE_ID_LENGTH = 20,
  LEAVE_TYPE_LENGTH = 20,
  NIN_LENGTH = 15,
  STATE_LENGTH = 50,
  PHONE_NUMBER_LENGTH_MAX = 15,
  PHONE_NUMBER_LENGTH_MIN = 7,
  ADDRESS_LENGTH = 100,
  VAT_ID_LENGTH = 50
}

export const MAX_PASSWORD_STRENGTH = 5;

export enum AccountSignIn {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE"
}

export enum BulkSummaryFlows {
  ENTITLEMENT_BULK_UPLOAD = "entitlement_bulk",
  USER_BULK_UPLOAD = "user_bulk"
}

export const INITIAL_COLOR_DISPLAY_COUNT = 6;

export enum daysTypes {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY"
}

export enum PasswordStrength {
  Great = "Great",
  Good = "Good",
  Decent = "Decent",
  Weak = "Weak"
}

export enum AuthStatus {
  Authenticated = "authenticated"
}

export const PASSWORD_STRENGTH_MULTIPLIER = 20;

export const VOID_MESSAGE_LENGTH = 255;

export enum EmailProvider {
  GMAIL = "Gmail",
  OUTLOOK = "Outlook",
  YAHOO = "Yahoo"
}
export const DEFAULT_PORT = "587";
export const DISABLED_PORT = "-";

export const BrandingBlueColor = {
  primary: {
    main: "#93C5FD",
    dark: "#2A61A0"
  },
  secondary: {
    main: "#DBEAFE",
    dark: "#408CE4"
  }
};

export const SUCCESS = "success";
export const CANCEL = "cancel";

export const APP = "app";
export const LOCALHOST = "localhost";
