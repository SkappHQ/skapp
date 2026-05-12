import { moduleAPIPath } from "~community/common/constants/configs";

export const companyEndpoints = {
  CREATE_COMPANY: "/company",
  CHECK_COMPANY_NAME_EXISTS: (name: string) =>
    `/company/exists?name=${encodeURIComponent(name)}`,
  GET_COMPANIES: `${moduleAPIPath.CRM}/companies`,
};

export const contactEndpoints = {
  COMPANIES_LOOKUP: `${moduleAPIPath.CRM}/companies/lookup`,
  GET_OWNERS: `${moduleAPIPath.CRM}/owners`,
  CREATE_CONTACT: `${moduleAPIPath.CRM}/contacts`
};
