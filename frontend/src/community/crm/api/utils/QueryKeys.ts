export const taskQueryKeys = {
  ALL: ["crm-tasks"],
  GET_BY_CONTACT: (contactId: number) => ["crm-tasks", "contact", contactId]
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
