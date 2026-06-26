import { BloodGroupTypes } from "~community/people/enums/PeopleEnums";
import {
  L3EducationalDetailsType,
  L3FamilyDetailsType,
  L3HealthAndOtherDetailsType
} from "~community/people/types/PeopleTypes";

import {
  getContactDetailsChanges,
  getEducationalDetailsChanges,
  getFamilyDetailsChanges,
  getGeneralDetailsChanges,
  getHealthAndOtherDetailsChanges,
  getPersonalDetailsChanges,
  getSocialMediaDetailsChanges
} from "./personalDetailsChangesUtils";

describe("personalDetailsChangesUtils", () => {
  describe("getGeneralDetailsChanges", () => {
    it("should return changes for differing fields", () => {
      const newGeneral = { firstName: "John" };
      const previousGeneral = { firstName: "Doe" };
      const result = getGeneralDetailsChanges(newGeneral, previousGeneral);
      expect(result).toEqual({ firstName: "John" });
    });

    it("should return an empty object if no changes are detected", () => {
      const newGeneral = { firstName: "John" };
      const previousGeneral = { firstName: "John" };
      const result = getGeneralDetailsChanges(newGeneral, previousGeneral);
      expect(result).toEqual({});
    });
  });

  describe("getContactDetailsChanges", () => {
    it("should return changes for differing fields", () => {
      const newContact = { personalEmail: "new@example.com" };
      const previousContact = { personalEmail: "old@example.com" };
      const result = getContactDetailsChanges(newContact, previousContact);
      expect(result).toEqual({ personalEmail: "new@example.com" });
    });

    it("should return an empty object if no changes are detected", () => {
      const newContact = { personalEmail: "same@example.com" };
      const previousContact = { personalEmail: "same@example.com" };
      const result = getContactDetailsChanges(newContact, previousContact);
      expect(result).toEqual({});
    });
  });

  describe("getFamilyDetailsChanges", () => {
    it("should return the entire new array if lengths differ", () => {
      const newFamily = [{ familyId: 1 }];
      const previousFamily = [] as L3FamilyDetailsType[];
      const result = getFamilyDetailsChanges(newFamily, previousFamily);
      expect(result).toEqual(newFamily);
    });

    it("should return an empty array if no changes are detected", () => {
      const newFamily = [{ familyId: 1, firstName: "John" }];
      const previousFamily = [{ familyId: 1, firstName: "John" }];
      const result = getFamilyDetailsChanges(newFamily, previousFamily);
      expect(result).toEqual([]);
    });
  });

  describe("getEducationalDetailsChanges", () => {
    it("should return the entire new array if lengths differ", () => {
      const newEducational = [{ educationId: 1 }];
      const previousEducational = [] as L3EducationalDetailsType[];
      const result = getEducationalDetailsChanges(
        newEducational,
        previousEducational
      );
      expect(result).toEqual(newEducational);
    });

    it("should return an empty array if no changes are detected", () => {
      const newEducational = [{ educationId: 1, degree: "BSc" }];
      const previousEducational = [{ educationId: 1, degree: "BSc" }];
      const result = getEducationalDetailsChanges(
        newEducational,
        previousEducational
      );
      expect(result).toEqual([]);
    });
  });

  describe("getSocialMediaDetailsChanges", () => {
    it("should return changes for differing fields", () => {
      const newSocialMedia = { linkedIn: "new-linkedin" };
      const previousSocialMedia = { linkedIn: "old-linkedin" };
      const result = getSocialMediaDetailsChanges(
        newSocialMedia,
        previousSocialMedia
      );
      expect(result).toEqual({ linkedIn: "new-linkedin" });
    });

    it("should return an empty object if no changes are detected", () => {
      const newSocialMedia = { linkedIn: "same-linkedin" };
      const previousSocialMedia = { linkedIn: "same-linkedin" };
      const result = getSocialMediaDetailsChanges(
        newSocialMedia,
        previousSocialMedia
      );
      expect(result).toEqual({});
    });
  });

  describe("getHealthAndOtherDetailsChanges", () => {
    it("should return changes for differing fields", () => {
      const newHealthAndOther: L3HealthAndOtherDetailsType = {
        bloodGroup: BloodGroupTypes.A_NEGATIVE
      };
      const previousHealthAndOther = {
        bloodGroup: BloodGroupTypes.AB_NEGATIVE
      };
      const result = getHealthAndOtherDetailsChanges(
        newHealthAndOther,
        previousHealthAndOther
      );
      expect(result).toEqual({ bloodGroup: BloodGroupTypes.A_NEGATIVE });
    });

    it("should return an empty object if no changes are detected", () => {
      const newHealthAndOther = { bloodGroup: BloodGroupTypes.AB_NEGATIVE };
      const previousHealthAndOther = {
        bloodGroup: BloodGroupTypes.AB_NEGATIVE
      };
      const result = getHealthAndOtherDetailsChanges(
        newHealthAndOther,
        previousHealthAndOther
      );
      expect(result).toEqual({});
    });
  });

  describe("getPersonalDetailsChanges", () => {
    it("should return changes for differing fields in nested objects", () => {
      const newPersonalDetails = { general: { firstName: "John" } };
      const previousPersonalDetails = { general: { firstName: "Doe" } };
      const result = getPersonalDetailsChanges(
        newPersonalDetails,
        previousPersonalDetails
      );
      expect(result).toEqual({ general: { firstName: "John" } });
    });

    it("should return an empty object if no changes are detected", () => {
      const newPersonalDetails = { general: { firstName: "John" } };
      const previousPersonalDetails = { general: { firstName: "John" } };
      const result = getPersonalDetailsChanges(
        newPersonalDetails,
        previousPersonalDetails
      );
      expect(result).toEqual({});
    });
  });
});
