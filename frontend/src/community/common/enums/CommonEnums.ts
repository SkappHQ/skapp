export enum ZIndexEnums {
  //  New Config: Remove the above values after replacing the current values with new values.
  //  Before using values please refer documentation and below values
  //  MUI Default Values: SNACKBAR = 1400, TOOLTIP = 1500, MODAL = 1300, DRAWER = 1200, APP_BAR = 1100, MOBILE_STEPPER = 1000, OVERLAY = 1600, NAVBAR = 1700, HEADER = 1800, POPUP = 1900

  APP_BAR = 1100,
  POPOVER = 100,
  TOAST = 1400,
  SKIP_TO_CONTENT = 1500,
  MAX = 2000,
  DEFAULT = 1,
  MIN = 0,
  LEVEL_2 = 2,
  MODAL = 1300
}

export enum GlobalLoginMethod {
  CREDENTIALS = "CREDENTIALS",
  GOOGLE = "GOOGLE",
  MICROSOFT = "MICROSOFT",
  NONE = ""
}

export enum CalendarType {
  GOOGLE = "GOOGLE",
  MICROSOFT = "MICROSOFT"
}

export enum Modules {
  LEAVE = "LEAVE",
  ATTENDANCE = "ATTENDANCE",
  PEOPLE = "PEOPLE",
  ESIGNATURE = "ESIGNATURE",
  NONE = ""
}

export enum FileTypes {
  ORGANIZATION_LOGOS = "ORGANIZATION_LOGOS",
  USER_IMAGE = "USER_IMAGE",
  LEAVE_ATTACHMENTS = "LEAVE_ATTACHMENTS"
}

export enum DayOfWeek {
  MON = "MON",
  TUE = "TUE",
  WED = "WED",
  THU = "THU",
  FRI = "FRI",
  SAT = "SAT",
  SUN = "SUN"
}

export enum AppVersionNotificationType {
  CRITICAL = "critical",
  INFO = "info"
}

export enum HalfDayType {
  MORNING = "morning",
  EVENING = "evening"
}
