export type EmployeeBreakdownData = {
  employmentTypesResponseDto: {
    permanent?: number;
    intern?: number;
    contract?: number;
  };
  employmentAllocationResponseDto: {
    fullTime?: number;
    partTime?: number;
  };
};

export type EmployeeData = {
  totalActiveEmployees: number;
  totalActiveMaleEmployees: number;
  totalActiveFemaleEmployees: number;
  totalActiveOtherEmployees: number;
};

export type JobFamily = {
  jobFamilyId: number;
  jobFamilyName: string;
  employeeCount: number;
  jobTitleOverview: JobTitle[];
};

export type JobFamilyInput = {
  jobFamilyOverviewDtos: JobFamily[];
};

export type JobTitle = {
  jobTitleId: number;
  jobTitleName: string;
  employeeCount: number;
};

export type JobTitleOutput = {
  value: number;
  name: string;
};

export type JobFamilyOutput = {
  value: number;
  name: string;
  jobTitles: JobTitleOutput[];
};

//graph data types
export type EmploymentBreakdownType = {
  labels: string[];
  values: number[];
  colors: string[];
};

export type GenderDistributionType = {
  value: number;
  name: string;
  itemStyle: { color: string };
};

export type JobFamilyBreakdownType = {
  value: number;
  name: string;
  jobTitles: JobTitleOutput[];
};
