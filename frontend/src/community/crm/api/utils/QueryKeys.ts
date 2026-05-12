export const companyQueryKeys = {
  GET_COMPANY_TABLE_DATA: ["get-company-table-data"],
  CHECK_COMPANY_NAME_EXISTS: ["check-company-name-exists"],
  CRM_COMPANIES: (params?: object) =>
    ["crm-companies", params].filter((val) => val !== undefined),
  CRM_OWNERS: (params?: object) =>
    ["crm-owners", params].filter((val) => val !== undefined),
  CRM_CONTACTS: ["crm-contacts"]
};
