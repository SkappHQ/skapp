export const companyEndpoints = {
  CREATE_COMPANY: "/company",
  CHECK_COMPANY_NAME_EXISTS: (name: string) =>
    `/company/exists?name=${encodeURIComponent(name)}`
};
