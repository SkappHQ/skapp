export const contactQueryKeys = {
  GET_CONTACT_DATA_BY_SEARCH: (
    searchKeyword: string,
    limit: number,
    companyId?: number
  ) => [
    "crm-contacts",
    searchKeyword,
    limit,
    ...(companyId !== undefined ? [companyId] : [])
  ],
  CRM_COMPANIES: (params?: object) =>
    ["crm-companies", params].filter((val) => val !== undefined)
};

export const companyQueryKeys = {
  GET_COMPANY_DATA: ["get-company-data"],
  GET_COMPANY_DATA_BY_SEARCH: (searchKeyword: string, limit: number) => [
    "get-company-data",
    searchKeyword,
    limit
  ],
  CHECK_COMPANY_NAME_EXISTS: ["check-company-name-exists"]
};
