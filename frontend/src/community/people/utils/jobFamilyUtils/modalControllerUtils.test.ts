import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { JobFamilyActionModalEnums } from "~community/people/enums/JobFamilyEnums";
import {
  AllJobFamilyType,
  CurrentEditingJobFamilyType,
  TransferMemberFormType
} from "~community/people/types/JobFamilyTypes";

import {
  checkDataChanges,
  getCustomStyles,
  getModalTitle,
  handleJobFamilyCloseModal,
  hasJobFamilyMemberDataChanged,
  hasJobTitleMemberDataChanged,
  isClosableModalType
} from "./modalControllerUtils";

describe("modalControllerUtils", () => {
  const commonTranslateText: TranslatorFunctionType = (keys: string[]) =>
    keys.join(",");

  const peopleTranslateText: TranslatorFunctionType = (keys: string[]) =>
    keys.join(",");

  describe("getModalTitle", () => {
    it("should return the correct title for ADD_JOB_FAMILY", () => {
      expect(
        getModalTitle(
          JobFamilyActionModalEnums.ADD_JOB_FAMILY,
          commonTranslateText
        )
      ).toBe("addJobFamilyModalTitle");
    });

    it("should return the correct title for EDIT_JOB_FAMILY", () => {
      expect(
        getModalTitle(
          JobFamilyActionModalEnums.EDIT_JOB_FAMILY,
          peopleTranslateText
        )
      ).toBe("editJobFamilyModalTitle");
    });

    it("should return an empty string for an unknown modal type", () => {
      expect(
        getModalTitle(JobFamilyActionModalEnums.NONE, peopleTranslateText)
      ).toBe("");
    });
  });

  describe("isClosableModalType", () => {
    it("should return true for ADD_JOB_FAMILY", () => {
      expect(
        isClosableModalType(JobFamilyActionModalEnums.ADD_JOB_FAMILY)
      ).toBe(true);
    });

    it("should return false for JOB_FAMILY_TRANSFER_MEMBERS", () => {
      expect(
        isClosableModalType(
          JobFamilyActionModalEnums.JOB_FAMILY_TRANSFER_MEMBERS
        )
      ).toBe(false);
    });
  });

  describe("getCustomStyles", () => {
    it("should return custom styles for JOB_FAMILY_TRANSFER_MEMBERS", () => {
      expect(
        getCustomStyles(JobFamilyActionModalEnums.JOB_FAMILY_TRANSFER_MEMBERS)
      ).toEqual({
        modalWrapperStyles: { width: { xs: "100%", sm: "37.5rem" } },
        modalContentStyles: {
          maxWidth: { xs: "calc(100dvw - 1.25rem)", sm: "37.5rem" }
        }
      });
    });

    it("should return default styles for ADD_JOB_FAMILY", () => {
      expect(getCustomStyles(JobFamilyActionModalEnums.ADD_JOB_FAMILY)).toEqual(
        {
          modalWrapperStyles: {},
          modalContentStyles: {}
        }
      );
    });
  });

  describe("handleJobFamilyCloseModal", () => {
    it("should set the correct modal type when data has changed", () => {
      const setJobFamilyModalType = jest.fn();
      const stopAllOngoingQuickSetup = jest.fn();
      handleJobFamilyCloseModal({
        hasDataChanged: true,
        jobFamilyModalType: JobFamilyActionModalEnums.ADD_JOB_FAMILY,
        setJobFamilyModalType: setJobFamilyModalType,
        stopAllOngoingQuickSetup: stopAllOngoingQuickSetup
      });
      expect(setJobFamilyModalType).toHaveBeenCalledWith(
        JobFamilyActionModalEnums.UNSAVED_CHANGES_JOB_FAMILY
      );
    });

    it("should set the modal type to NONE when data has not changed", () => {
      const setJobFamilyModalType = jest.fn();
      const stopAllOngoingQuickSetup = jest.fn();
      handleJobFamilyCloseModal({
        hasDataChanged: false,
        jobFamilyModalType: JobFamilyActionModalEnums.ADD_JOB_FAMILY,
        setJobFamilyModalType: setJobFamilyModalType,
        stopAllOngoingQuickSetup: stopAllOngoingQuickSetup
      });
      expect(setJobFamilyModalType).toHaveBeenCalledWith(
        JobFamilyActionModalEnums.NONE
      );
    });
  });

  describe("hasJobFamilyMemberDataChanged", () => {
    it("should return true if job title or job family is not null", () => {
      const data: TransferMemberFormType[] = [
        { jobTitle: { jobTitleId: 1, name: "title" }, jobFamily: null }
      ];
      expect(hasJobFamilyMemberDataChanged(data)).toBe(true);
    });

    it("should return false if all job titles and job families are null", () => {
      const data: TransferMemberFormType[] = [
        { jobTitle: null, jobFamily: null }
      ];
      expect(hasJobFamilyMemberDataChanged(data)).toBe(false);
    });
  });

  describe("hasJobTitleMemberDataChanged", () => {
    it("should return true if job title is not null", () => {
      const data: TransferMemberFormType[] = [
        { jobTitle: { jobTitleId: 1, name: "title" }, jobFamily: null }
      ];
      expect(hasJobTitleMemberDataChanged(data)).toBe(true);
    });

    it("should return false if all job titles are null", () => {
      const data: TransferMemberFormType[] = [
        { jobTitle: null, jobFamily: null }
      ];
      expect(hasJobTitleMemberDataChanged(data)).toBe(false);
    });
  });

  describe("checkDataChanges", () => {
    const currentEditingJobFamily: CurrentEditingJobFamilyType = {
      jobFamilyId: 1,
      name: "Engineering",
      jobTitles: [
        {
          jobTitleId: 1,
          name: "Engineer"
        }
      ]
    };
    const allJobFamilies: AllJobFamilyType[] = [
      {
        jobFamilyId: 1,
        name: "Engineering",
        jobTitles: [
          {
            jobTitleId: 1,
            name: "Engineer"
          }
        ],
        employees: []
      }
    ];

    it("should return true if job family name or titles have changed", () => {
      const modifiedJobFamily = {
        ...currentEditingJobFamily,
        name: "New Engineering"
      };
      expect(
        checkDataChanges(
          JobFamilyActionModalEnums.EDIT_JOB_FAMILY,
          modifiedJobFamily,
          allJobFamilies,
          null
        )
      ).toBe(true);
    });

    it("should return false if job family name and titles have not changed", () => {
      expect(
        checkDataChanges(
          JobFamilyActionModalEnums.EDIT_JOB_FAMILY,
          currentEditingJobFamily,
          allJobFamilies,
          null
        )
      ).toBe(false);
    });

    it("should return true if transfer members data has changed", () => {
      const transferMembersData: TransferMemberFormType[] = [
        { jobTitle: { jobTitleId: 1, name: "title" }, jobFamily: null }
      ];
      expect(
        checkDataChanges(
          JobFamilyActionModalEnums.JOB_FAMILY_TRANSFER_MEMBERS,
          null,
          null,
          transferMembersData
        )
      ).toBe(true);
    });

    it("should return false if transfer members data has not changed", () => {
      const transferMembersData: TransferMemberFormType[] = [
        { jobTitle: null, jobFamily: null }
      ];
      expect(
        checkDataChanges(
          JobFamilyActionModalEnums.JOB_FAMILY_TRANSFER_MEMBERS,
          null,
          null,
          transferMembersData
        )
      ).toBe(false);
    });
  });
});
