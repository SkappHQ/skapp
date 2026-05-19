export const crmEndpoints = {
  GET_TASKS_BY_COMPANY: (companyId: number) => `/company/${companyId}/task`,
  UPDATE_TASK_COMPLETION: (taskId: number) => `/task/${taskId}/completion`
};

export const companyEndpoints = {
  GET_ALL_COMPANIES: "/company",
  GET_COMPANY_METRICS: "/company/metrics",
  CREATE_COMPANY: "/company",
  CHECK_COMPANY_NAME_EXISTS: (name: string) =>
    `/company/exists?name=${encodeURIComponent(name)}`,
  DELETE_COMPANY: (companyId: number) => `/company/${companyId}/delete`
};
