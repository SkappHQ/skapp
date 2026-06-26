import { ToastType } from "~community/common/enums/ComponentEnums";
import {
  JobFamilyActionModalEnums,
  JobFamilyToastEnums
} from "~community/people/enums/JobFamilyEnums";

import { handleJobFamilyApiResponse } from "./apiUtils";

describe("handleJobFamilyApiResponse", () => {
  const mockSetToastMessage = jest.fn();
  const mockSetJobFamilyModalType = jest.fn();
  const mockTranslateText = jest.fn((key) => key[0]);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle AT_LEAST_ONE_JOB_TITLE case", () => {
    handleJobFamilyApiResponse({
      type: JobFamilyToastEnums.AT_LEAST_ONE_JOB_TITLE,
      setToastMessage: mockSetToastMessage,
      translateText: mockTranslateText
    });

    expect(mockSetToastMessage).toHaveBeenCalledWith({
      open: true,
      toastType: ToastType.ERROR,
      title: "atLeastOneJobTitleRequired.title",
      description: "atLeastOneJobTitleRequired.description"
    });
  });

  it("should handle ADD_JOB_FAMILY_SUCCESS case with modal close", () => {
    handleJobFamilyApiResponse({
      type: JobFamilyToastEnums.ADD_JOB_FAMILY_SUCCESS,
      setToastMessage: mockSetToastMessage,
      setJobFamilyModalType: mockSetJobFamilyModalType,
      translateText: mockTranslateText
    });

    expect(mockSetToastMessage).toHaveBeenCalledWith({
      open: true,
      toastType: ToastType.SUCCESS,
      title: "addJobFamilySuccessToastTitle",
      description: "addJobFamilySuccessToastDescription"
    });
    expect(mockSetJobFamilyModalType).toHaveBeenCalledWith(
      JobFamilyActionModalEnums.NONE
    );
  });

  it('should handle ADD_JOB_FAMILY_SUCCESS case without modal close when from="add-new-resource"', () => {
    handleJobFamilyApiResponse({
      type: JobFamilyToastEnums.ADD_JOB_FAMILY_SUCCESS,
      setToastMessage: mockSetToastMessage,
      setJobFamilyModalType: mockSetJobFamilyModalType,
      translateText: mockTranslateText,
      from: "add-new-resource"
    });

    expect(mockSetToastMessage).toHaveBeenCalledWith({
      open: true,
      toastType: ToastType.SUCCESS,
      title: "addJobFamilySuccessToastTitle",
      description: "addJobFamilySuccessToastDescription"
    });
    expect(mockSetJobFamilyModalType).not.toHaveBeenCalled();
  });

  it("should handle ADD_JOB_FAMILY_ERROR case", () => {
    handleJobFamilyApiResponse({
      type: JobFamilyToastEnums.ADD_JOB_FAMILY_ERROR,
      setToastMessage: mockSetToastMessage,
      translateText: mockTranslateText
    });

    expect(mockSetToastMessage).toHaveBeenCalledWith({
      open: true,
      toastType: ToastType.ERROR,
      title: "jobFamilyErrorToastTitle",
      description: "addJobFamilyErrorToastDescription"
    });
  });

  it("should handle EDIT_JOB_FAMILY_SUCCESS case", () => {
    handleJobFamilyApiResponse({
      type: JobFamilyToastEnums.EDIT_JOB_FAMILY_SUCCESS,
      setToastMessage: mockSetToastMessage,
      setJobFamilyModalType: mockSetJobFamilyModalType,
      translateText: mockTranslateText
    });

    expect(mockSetToastMessage).toHaveBeenCalledWith({
      open: true,
      toastType: ToastType.SUCCESS,
      title: "editJobFamilySuccessToastTitle",
      description: "editJobFamilySuccessToastDescription"
    });
    expect(mockSetJobFamilyModalType).toHaveBeenCalledWith(
      JobFamilyActionModalEnums.NONE
    );
  });

  it("should handle JOB_FAMILY_TRANSFER_MEMBERS_SUCCESS case", () => {
    handleJobFamilyApiResponse({
      type: JobFamilyToastEnums.JOB_FAMILY_TRANSFER_MEMBERS_SUCCESS,
      setToastMessage: mockSetToastMessage,
      setJobFamilyModalType: mockSetJobFamilyModalType,
      translateText: mockTranslateText
    });

    expect(mockSetToastMessage).toHaveBeenCalledWith({
      open: true,
      toastType: ToastType.SUCCESS,
      title: "jobFamilyTransferMembersSuccessToastTitle",
      description: "jobFamilyTransferMembersSuccessToastDescription"
    });
    expect(mockSetJobFamilyModalType).toHaveBeenCalledWith(
      JobFamilyActionModalEnums.NONE
    );
  });

  it("should handle JOB_TITLE_TRANSFER_MEMBERS_SUCCESS case", () => {
    handleJobFamilyApiResponse({
      type: JobFamilyToastEnums.JOB_TITLE_TRANSFER_MEMBERS_SUCCESS,
      setToastMessage: mockSetToastMessage,
      setJobFamilyModalType: mockSetJobFamilyModalType,
      translateText: mockTranslateText
    });

    expect(mockSetToastMessage).toHaveBeenCalledWith({
      open: true,
      toastType: ToastType.SUCCESS,
      title: "jobTitleTransferMembersSuccessToastTitle",
      description: "jobTitleTransferMembersSuccessToastDescription"
    });
    expect(mockSetJobFamilyModalType).toHaveBeenCalledWith(
      JobFamilyActionModalEnums.EDIT_JOB_FAMILY
    );
  });

  it("should handle DELETE_JOB_TITLE_SUCCESS case", () => {
    handleJobFamilyApiResponse({
      type: JobFamilyToastEnums.DELETE_JOB_TITLE_SUCCESS,
      setToastMessage: mockSetToastMessage,
      setJobFamilyModalType: mockSetJobFamilyModalType,
      translateText: mockTranslateText
    });

    expect(mockSetToastMessage).toHaveBeenCalledWith({
      open: true,
      toastType: ToastType.SUCCESS,
      title: "deleteJobTitleSuccessToastTitle",
      description: "deleteJobTitleSuccessToastDescription"
    });
    expect(mockSetJobFamilyModalType).toHaveBeenCalledWith(
      JobFamilyActionModalEnums.EDIT_JOB_FAMILY
    );
  });

  it("should handle EDIT_JOB_TITLE_SUCCESS case", () => {
    handleJobFamilyApiResponse({
      type: JobFamilyToastEnums.EDIT_JOB_TITLE_SUCCESS,
      setToastMessage: mockSetToastMessage,
      setJobFamilyModalType: mockSetJobFamilyModalType,
      translateText: mockTranslateText
    });

    expect(mockSetToastMessage).toHaveBeenCalledWith({
      open: true,
      toastType: ToastType.SUCCESS,
      title: "editJobTitleSuccessToastTitle",
      description: "editJobTitleSuccessToastDescription"
    });
    expect(mockSetJobFamilyModalType).toHaveBeenCalledWith(
      JobFamilyActionModalEnums.EDIT_JOB_FAMILY
    );
  });

  it("should handle unknown type case", () => {
    handleJobFamilyApiResponse({
      type: "UNKNOWN_TYPE" as JobFamilyToastEnums,
      setToastMessage: mockSetToastMessage,
      setJobFamilyModalType: mockSetJobFamilyModalType,
      translateText: mockTranslateText
    });

    expect(mockSetToastMessage).not.toHaveBeenCalled();
    expect(mockSetJobFamilyModalType).not.toHaveBeenCalled();
  });
});
