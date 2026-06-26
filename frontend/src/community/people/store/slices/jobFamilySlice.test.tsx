import { create } from "zustand";

import { JobFamilyActionModalEnums } from "~community/people/enums/JobFamilyEnums";

import { jobFamilySlice } from "./jobFamilySlice";

describe("jobFamilySlice", () => {
  it("should set all job families correctly", () => {
    const useStore = create(jobFamilySlice);
    const { setAllJobFamilies } = useStore.getState();

    const mockJobFamilies = [{ id: 1, name: "Engineering" }];
    setAllJobFamilies(mockJobFamilies);

    expect(useStore.getState().allJobFamilies).toEqual(mockJobFamilies);
  });

  it("should set current editing job family correctly", () => {
    const useStore = create(jobFamilySlice);
    const { setCurrentEditingJobFamily } = useStore.getState();

    const mockEditingJobFamily = { id: 1, name: "Engineering" };
    setCurrentEditingJobFamily(mockEditingJobFamily);

    expect(useStore.getState().currentEditingJobFamily).toEqual(
      mockEditingJobFamily
    );
  });

  it("should set current deleting job family correctly", () => {
    const useStore = create(jobFamilySlice);
    const { setCurrentDeletingJobFamily } = useStore.getState();

    const mockDeletingJobFamily = { id: 1, name: "Engineering" };
    setCurrentDeletingJobFamily(mockDeletingJobFamily);

    expect(useStore.getState().currentDeletingJobFamily).toEqual(
      mockDeletingJobFamily
    );
  });

  it("should set current transfer members data correctly", () => {
    const useStore = create(jobFamilySlice);
    const { setCurrentTransferMembersData } = useStore.getState();

    const mockTransferMembersData = [{ memberId: 1, name: "John Doe" }];
    setCurrentTransferMembersData(mockTransferMembersData);

    expect(useStore.getState().currentTransferMembersData).toEqual(
      mockTransferMembersData
    );
  });

  it("should set previous job title data correctly", () => {
    const useStore = create(jobFamilySlice);
    const { setPreviousJobTitleData } = useStore.getState();

    const mockJobTitleData = { id: 1, title: "Software Engineer" };
    setPreviousJobTitleData(mockJobTitleData);

    expect(useStore.getState().previousJobTitleData).toEqual(mockJobTitleData);
  });

  it("should set isJobFamilyModalOpen correctly", () => {
    const useStore = create(jobFamilySlice);
    const { setIsJobFamilyModalOpen } = useStore.getState();

    setIsJobFamilyModalOpen(true);
    expect(useStore.getState().isJobFamilyModalOpen).toBe(true);

    setIsJobFamilyModalOpen(false);
    expect(useStore.getState().isJobFamilyModalOpen).toBe(false);
  });

  it("should set jobFamilyModalType correctly", () => {
    const useStore = create(jobFamilySlice);
    const { setJobFamilyModalType } = useStore.getState();

    setJobFamilyModalType(JobFamilyActionModalEnums.ADD);
    expect(useStore.getState().jobFamilyModalType).toBe(
      JobFamilyActionModalEnums.ADD
    );
    expect(useStore.getState().isJobFamilyModalOpen).toBe(true);

    setJobFamilyModalType(JobFamilyActionModalEnums.NONE);
    expect(useStore.getState().jobFamilyModalType).toBe(
      JobFamilyActionModalEnums.NONE
    );
    expect(useStore.getState().isJobFamilyModalOpen).toBe(false);
    expect(useStore.getState().currentEditingJobFamily).toBeNull();
    expect(useStore.getState().currentDeletingJobFamily).toBeNull();
    expect(useStore.getState().currentTransferMembersData).toBeNull();
    expect(useStore.getState().previousJobTitleData).toBeNull();
  });
});
