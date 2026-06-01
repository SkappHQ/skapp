export const contactQueryKeys = {
  GET_CONTACTS: ["crm-contacts"],
  CRM_OWNERS: (params?: object) =>
    ["crm-owners", params].filter((val) => val !== undefined),
  CRM_COMPANIES: (params?: object) =>
    ["crm-companies", params].filter((val) => val !== undefined)
}

export const companyQueryKeys = {
  GET_COMPANY_DATA: ["get-company-data"],
  GET_COMPANY_DATA_BY_SEARCH: (searchKeyword: string, limit: number) => [
    "get-company-data",
    searchKeyword,
    limit
  ],
  CHECK_COMPANY_NAME_EXISTS: ["check-company-name-exists"]
};
