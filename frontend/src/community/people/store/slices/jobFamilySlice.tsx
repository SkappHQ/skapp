import { SetType } from "~community/common/types/storeTypes";
import { JobFamilyActionModalEnums } from "~community/people/enums/JobFamilyEnums";
import {
  AllJobFamilyType,
  CurrentEditingJobFamilyType,
  DeletingJobFamily,
  JobTitleType,
  TransferMemberFormType
} from "~community/people/types/JobFamilyTypes";
import { JobFamilySliceType } from "~community/people/types/SliceTypes";

export const jobFamilySlice = (
  set: SetType<JobFamilySliceType>
): JobFamilySliceType => ({
  allJobFamilies: null,
  currentEditingJobFamily: null,
  currentDeletingJobFamily: null,
  currentTransferMembersData: null,
  previousJobTitleData: null,
  isJobFamilyModalOpen: false,
  jobFamilyModalType: JobFamilyActionModalEnums.NONE,

  setAllJobFamilies: (value: AllJobFamilyType[]) =>
    set((state: JobFamilySliceType) => ({
      ...state,
      allJobFamilies: value
    })),
  setCurrentEditingJobFamily: (value: CurrentEditingJobFamilyType | null) =>
    set((state: JobFamilySliceType) => ({
      ...state,
      currentEditingJobFamily: value
    })),
  setCurrentDeletingJobFamily: (value: DeletingJobFamily | null) =>
    set((state: JobFamilySliceType) => ({
      ...state,
      currentDeletingJobFamily: value
    })),
  setCurrentTransferMembersData: (value: TransferMemberFormType[] | null) =>
    set((state: JobFamilySliceType) => ({
      ...state,
      currentTransferMembersData: value
    })),
  setPreviousJobTitleData: (value: JobTitleType | null) =>
    set((state: JobFamilySliceType) => ({
      ...state,
      previousJobTitleData: value
    })),
  setIsJobFamilyModalOpen: (status: boolean) =>
    set((state: JobFamilySliceType) => ({
      ...state,
      isJobFamilyModalOpen: status
    })),
  setJobFamilyModalType: (status: JobFamilyActionModalEnums) =>
    set((state: JobFamilySliceType) => {
      if (status === JobFamilyActionModalEnums.NONE) {
        return {
          ...state,
          isJobFamilyModalOpen: false,
          jobFamilyModalType: status,
          currentEditingJobFamily: null,
          currentDeletingJobFamily: null,
          currentTransferMembersData: null,
          previousJobTitleData: null
        };
      }

      return {
        ...state,
        isJobFamilyModalOpen: true,
        jobFamilyModalType: status
      };
    })
});
