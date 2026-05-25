export const contactEndpoints = {
  GET_CONTACT_METRICS: "/contact/metrics",
  GET_COMPANIES: "/company/lookup"
};

export const companyEndpoints = {
  GET_COMPANY_METRICS: "/company/metrics",
  CREATE_COMPANY: "/company",
  CHECK_COMPANY_NAME_EXISTS: (name: string) =>
    `/company/exists?name=${encodeURIComponent(name)}`
};
