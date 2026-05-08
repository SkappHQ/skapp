import { moduleAPIPath } from "~community/common/constants/configs";

export const crmEndpoints = {
  GET_COMPANIES: `${moduleAPIPath.CRM}/companies`,
  GET_OWNERS: `${moduleAPIPath.CRM}/owners`,
  CREATE_CONTACT: `${moduleAPIPath.CRM}/contacts`
};
