export enum ApiVersions {
  V1 = "/v1",
  V2 = "/v2"
}

export enum moduleAPIPath {
  AUTH = "/auth",
  PEOPLE = "/people",
  LEAVE = "/leave",
  JOB = "/job",
  TIME = "/time",
  ORGANIZATION = "/organization",
  ROLES = "/roles"
}

export enum nextAuthOptions {
  SESSION_STRATEGY = "jwt",
  SESSION_MAX_AGE = 24 * 60 * 60
}

export enum unitConversion {
  MILLISECONDS_PER_SECOND = 1000,
  SECONDS_PER_MINUTE = 60,
  MINUTES_PER_HOUR = 60,
  HOURS_PER_DAY = 24,
  DAYS_PER_MONTH = 30,
  MILLISECONDS_PER_DAY = HOURS_PER_DAY *
    MINUTES_PER_HOUR *
    SECONDS_PER_MINUTE *
    MILLISECONDS_PER_SECOND,
  MILLISECONDS_PER_MONTH = MILLISECONDS_PER_DAY * DAYS_PER_MONTH
}

export const DEFAULT_COUNTRY_CODE = "94";

export enum appModes {
  ENTERPRISE = "enterprise",
  COMMUNITY = "community"
}

export const DOMAIN = ".skapp.com";
