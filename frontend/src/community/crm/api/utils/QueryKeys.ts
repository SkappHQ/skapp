export const contactQueryKeys = {
  GET_CONTACT_DATA_BY_SEARCH: (searchKeyword: string, limit: number) => [
    "crm-contacts",
    searchKeyword,
    limit
  ]
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
