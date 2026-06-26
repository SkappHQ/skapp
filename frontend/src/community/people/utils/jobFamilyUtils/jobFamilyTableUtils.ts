import { JobFamilyActionModalEnums } from "~community/people/enums/JobFamilyEnums";
import {
  AllJobFamilyType,
  CurrentEditingJobFamilyType,
  DeletingJobFamily
} from "~community/people/types/JobFamilyTypes";
import { sortJobTitlesArrayInAscendingOrder } from "~community/people/utils/jobFamilyUtils/commonUtils";

export const handleJobFamilyEditBtnClick = (
  jobFamilyData: AllJobFamilyType,
  setCurrentEditingJobFamily: (value: CurrentEditingJobFamilyType) => void,
  setJobFamilyModalType: (value: JobFamilyActionModalEnums) => void
) => {
  const { jobFamilyId, name, jobTitles } = jobFamilyData;

  const sortedJobTitles = sortJobTitlesArrayInAscendingOrder(jobTitles);

  const currentEditingJobFamily: CurrentEditingJobFamilyType = {
    jobFamilyId,
    name,
    jobTitles: sortedJobTitles
  };

  setCurrentEditingJobFamily(currentEditingJobFamily);
  setJobFamilyModalType(JobFamilyActionModalEnums.EDIT_JOB_FAMILY);
};

export const handleJobFamilyDeleteBtnClick = (
  allJobFamilies: AllJobFamilyType[] | undefined,
  jobFamilyData: AllJobFamilyType,
  setCurrentDeletingJobFamily: (value: DeletingJobFamily | null) => void,
  setJobFamilyModalType: (value: JobFamilyActionModalEnums) => void
) => {
  const { employees = [], jobFamilyId } = jobFamilyData;

  const employeeCount = employees.length;
  const jobFamilyCount = allJobFamilies?.length ?? 0;

  if (employeeCount === 0 || jobFamilyCount > 0) {
    setCurrentDeletingJobFamily({
      jobFamilyId: jobFamilyId,
      employees: employees
    });
  }

  if (employeeCount === 0) {
    setJobFamilyModalType(
      JobFamilyActionModalEnums.JOB_FAMILY_DELETE_CONFIRMATION
    );
  } else {
    const modalType =
      jobFamilyCount === 1
        ? JobFamilyActionModalEnums.ADD_NEW_JOB_FAMILY
        : JobFamilyActionModalEnums.JOB_FAMILY_DELETION_WARNING;
    setJobFamilyModalType(modalType);
  }
};
