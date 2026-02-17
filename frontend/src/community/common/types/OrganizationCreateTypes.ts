import { ThemeTypes } from "./AvailableThemeColors";

export interface SuperAdminCreateType {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface OrganizationCreateType {
  organizationName: string;
  organizationWebsite: string;
  country: string;
  organizationLogo: string;
  themeColor: string;
  appUrl?: string;
}

export interface OrgSetupStatusType {
  isOrganizationSetupCompleted: boolean;
  isSignUpCompleted: boolean;
}

export type Organization = {
  companyName?: string;
  companyWebsite?: string;
  country?: string;
  accountUrl?: string;
  loginMethod?: string;
};

export interface OrganizationDetailsType {
  organizationName: string;
  organizationWebsite: string;
  country: string;
  organizationTimeZone: string;
  organizationLogo: string;
  themeColor: ThemeTypes;
}