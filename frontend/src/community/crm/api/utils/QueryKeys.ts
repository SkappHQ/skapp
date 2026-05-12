export const companyQueryKeys = {
  GET_COMPANY_TABLE_DATA: ["get-company-table-data"],
  GET_COMPANY_TABLE_DATA_BY_SEARCH: (searchKeyword: string, limit: number) => [
    "get-company-table-data-by-search",
    searchKeyword,
    limit
  ],
  CHECK_COMPANY_NAME_EXISTS: ["check-company-name-exists"]
};
