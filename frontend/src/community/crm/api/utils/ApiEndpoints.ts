export const companyEndpoints = {
  GET_ALL_COMPANIES: "/company",
  GET_COMPANY_TABLE_DATA: "/company/table-view",
  CREATE_COMPANY: "/company",
  CHECK_COMPANY_NAME_EXISTS: (name: string) =>
    `/company/exists?name=${encodeURIComponent(name)}`
};
