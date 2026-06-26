import {
  L3CareerProgressionDetailsType,
  L3VisaDetailsType
} from "~community/people/types/PeopleTypes";

import {
  getCareerProgressionChanges,
  getEmploymentChanges,
  getIdentificationDetailsChanges,
  getPreviousEmploymentChanges,
  getVisaDetailsChanges
} from "./employmentDetailsChangesUtils";

describe("employmentDetailsChangesUtils", () => {
  describe("getEmploymentChanges", () => {
    it("should return changes for differing fields", () => {
      const newEmployment = { employeeNumber: "123" };
      const previousEmployment = { employeeNumber: "456" };
      const result = getEmploymentChanges(newEmployment, previousEmployment);
      expect(result).toEqual({ employeeNumber: "123" });
    });

    it("should return an empty object if no changes are detected", () => {
      const newEmployment = { employeeNumber: "123" };
      const previousEmployment = { employeeNumber: "123" };
      const result = getEmploymentChanges(newEmployment, previousEmployment);
      expect(result).toEqual({});
    });
  });

  describe("getCareerProgressionChanges", () => {
    it("should return the entire new array if lengths differ", () => {
      const newCareer = [{ progressionId: 1 }];
      const previousCareer: L3CareerProgressionDetailsType[] = [];
      const result = getCareerProgressionChanges(newCareer, previousCareer);
      expect(result).toEqual(newCareer);
    });
  });

  describe("getIdentificationDetailsChanges", () => {
    it("should return changes for differing fields", () => {
      const newDetails = { ssn: "123-45-6789" };
      const previousDetails = { ssn: "987-65-4321" };
      const result = getIdentificationDetailsChanges(
        newDetails,
        previousDetails
      );
      expect(result).toEqual({ ssn: "123-45-6789" });
    });

    it("should return an empty object if no changes are detected", () => {
      const newDetails = { ssn: "123-45-6789" };
      const previousDetails = { ssn: "123-45-6789" };
      const result = getIdentificationDetailsChanges(
        newDetails,
        previousDetails
      );
      expect(result).toEqual({});
    });
  });

  describe("getPreviousEmploymentChanges", () => {
    it("should return the entire new array if lengths differ", () => {
      const newEmployments = [{ employmentId: 1 }];
      const previousEmployments = [] as L3CareerProgressionDetailsType[];
      const result = getPreviousEmploymentChanges(
        newEmployments,
        previousEmployments
      );
      expect(result).toEqual(newEmployments);
    });

    it("should return an empty array if no changes are detected", () => {
      const newEmployments = [{ employmentId: 1, companyName: "ABC Corp" }];
      const previousEmployments = [
        { employmentId: 1, companyName: "ABC Corp" }
      ];
      const result = getPreviousEmploymentChanges(
        newEmployments,
        previousEmployments
      );
      expect(result).toEqual([]);
    });
  });

  describe("getVisaDetailsChanges", () => {
    it("should return the entire new array if lengths differ", () => {
      const newVisas = [{ visaId: 1 }];
      const previousVisas = [] as L3VisaDetailsType[];
      const result = getVisaDetailsChanges(newVisas, previousVisas);
      expect(result).toEqual(newVisas);
    });

    it("should return an empty array if no changes are detected", () => {
      const newVisas = [{ visaId: 1, visaType: "H1B" }];
      const previousVisas = [{ visaId: 1, visaType: "H1B" }];
      const result = getVisaDetailsChanges(newVisas, previousVisas);
      expect(result).toEqual([]);
    });
  });
});
