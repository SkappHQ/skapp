import { theme } from "~community/common/theme/theme";

import {
  EmployeeBreakdownData,
  EmployeeData,
  JobFamilyInput,
  JobFamilyOutput
} from "../types/PeopleDashboardTypes";

type EmploymentTypeKeys = "intern" | "contract" | "permanent";
type EmploymentAllocationKeys = "fullTime" | "partTime";

const typeColors: Record<EmploymentTypeKeys, string> = {
  intern: theme.palette.graphColors.yellow,
  contract: theme.palette.graphColors.pink,
  permanent: theme.palette.graphColors.green
};
const allocationColors: Record<EmploymentAllocationKeys, string> = {
  fullTime: theme.palette.graphColors.yellow,
  partTime: theme.palette.graphColors.pink
};

export const employmentBreakdownGraphPreprocessor = (
  data: EmployeeBreakdownData
) => {
  const typeData = data?.employmentTypesResponseDto
    ? {
        labels: Object.keys(data.employmentTypesResponseDto).map(
          (key) => key.charAt(0).toUpperCase() + key.slice(1)
        ),
        values: Object.values(data.employmentTypesResponseDto),
        colors: Object.keys(data.employmentTypesResponseDto).map(
          (key) => typeColors[key as EmploymentTypeKeys]
        )
      }
    : { labels: [], values: [], colors: [] };

  const allocationData = data.employmentAllocationResponseDto
    ? {
        labels: Object.keys(data.employmentAllocationResponseDto).map(
          (key) => key.charAt(0).toUpperCase() + key.slice(1)
        ),
        values: Object.values(data.employmentAllocationResponseDto),
        colors: Object.keys(data.employmentAllocationResponseDto).map(
          (key) => allocationColors[key as EmploymentAllocationKeys]
        )
      }
    : { labels: [], values: [], colors: [] };

  return { type: typeData, allocation: allocationData };
};

type EmployeeOutput = {
  value: number;
  name: string;
  itemStyle: { color: string };
};

export const genderDistributionGraphPreprocessor = (
  data: EmployeeData
): EmployeeOutput[] => {
  const {
    totalActiveMaleEmployees,
    totalActiveFemaleEmployees,
    totalActiveOtherEmployees
  } = data;

  return [
    {
      value: totalActiveMaleEmployees,
      name: "Male",
      itemStyle: { color: theme.palette.graphColors.blue }
    },
    {
      value: totalActiveFemaleEmployees,
      name: "Female",
      itemStyle: { color: theme.palette.graphColors.pink }
    },
    {
      value: totalActiveOtherEmployees,
      name: "Other",
      itemStyle: { color: theme.palette.graphColors.yellow }
    }
  ];
};

export const jobFamilyGraphPreprocessor = (
  data: JobFamilyInput
): JobFamilyOutput[] => {
  return data.jobFamilyOverviewDtos.map((jobFamily) => ({
    value: jobFamily.employeeCount,
    name: jobFamily.jobFamilyName,
    jobTitles: jobFamily.jobTitleOverview.map((jobTitle) => ({
      value: jobTitle.employeeCount,
      name: jobTitle.jobTitleName
    }))
  }));
};
