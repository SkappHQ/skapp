import {
  BloodGroupList,
  EEOJobCategoryList,
  EmergencyContactRelationshipList,
  EmployeeTypesList,
  EmployementAllocationList,
  EmployementStatusList,
  EthnicityList,
  GenderList,
  MaritalStatusList,
  NationalityList,
  PermissionsList,
  RelationshipList,
  SystemPermissionList
} from "./employeeSetupStaticData";

describe("employeeSetupStaticData", () => {
  it("should validate PermissionsList structure", () => {
    expect(PermissionsList).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: expect.any(String),
          value: expect.any(String)
        })
      ])
    );
  });

  it("should validate EmployeeTypesList structure", () => {
    expect(EmployeeTypesList).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: expect.any(String),
          value: expect.any(String)
        })
      ])
    );
  });

  it("should validate GenderList structure", () => {
    expect(GenderList).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: expect.any(String),
          value: expect.any(String)
        })
      ])
    );
  });

  it("should validate MaritalStatusList structure", () => {
    expect(MaritalStatusList).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: expect.any(String),
          value: expect.any(String)
        })
      ])
    );
  });

  it("should validate RelationshipList structure", () => {
    expect(RelationshipList).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: expect.any(String),
          value: expect.any(String)
        })
      ])
    );
  });

  it("should validate EmergencyContactRelationshipList structure", () => {
    expect(EmergencyContactRelationshipList).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: expect.any(String),
          value: expect.any(String)
        })
      ])
    );
  });

  it("should validate EmployementStatusList structure", () => {
    expect(EmployementStatusList).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: expect.any(String),
          value: expect.any(String)
        })
      ])
    );
  });

  it("should validate EmployementAllocationList structure", () => {
    expect(EmployementAllocationList).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: expect.any(String),
          value: expect.any(String)
        })
      ])
    );
  });

  it("should validate SystemPermissionList structure", () => {
    expect(SystemPermissionList).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: expect.any(String),
          value: expect.any(String)
        })
      ])
    );
  });

  it("should validate BloodGroupList structure", () => {
    expect(BloodGroupList).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: expect.any(String),
          value: expect.any(String)
        })
      ])
    );
  });

  it("should validate EEOJobCategoryList structure", () => {
    expect(EEOJobCategoryList).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: expect.any(String),
          value: expect.any(String)
        })
      ])
    );
  });

  it("should validate EthnicityList structure", () => {
    expect(EthnicityList).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: expect.any(String),
          value: expect.any(String)
        })
      ])
    );
  });

  it("should validate NationalityList structure", () => {
    expect(NationalityList).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: expect.any(String),
          value: expect.any(String)
        })
      ])
    );
  });
});
