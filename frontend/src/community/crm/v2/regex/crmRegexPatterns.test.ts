import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { getContactValidationSchema } from "~community/crm/v2/utils/contactValidations";

import { isContactNameValid } from "./crmRegexPatterns";

describe("isContactNameValid", () => {
  it("should accept letters, spaces, hyphens, periods, commas and apostrophes", () => {
    expect(isContactNameValid().test("Jane Smith")).toBe(true);
    expect(isContactNameValid().test("O'Brien, Jane")).toBe(true);
    expect(isContactNameValid().test("Anne-Marie St. Clair")).toBe(true);
    expect(isContactNameValid().test("José Müller")).toBe(true);
  });

  it("should reject names containing numbers", () => {
    expect(isContactNameValid().test("Jane Smith 123")).toBe(false);
    expect(isContactNameValid().test("12345")).toBe(false);
  });

  it("should reject names containing special characters", () => {
    expect(isContactNameValid().test("Jane@Smith!")).toBe(false);
    expect(isContactNameValid().test("Jane#Smith")).toBe(false);
  });
});

describe("getContactValidationSchema", () => {
  const translator = ((keys: string[]) =>
    keys.join(".")) as unknown as TranslatorFunctionType;

  const schema = getContactValidationSchema(translator);

  const validContact = {
    name: "Jane Smith",
    email: "jane@acme.com",
    contactNumber: "94771234567",
    companyId: 1,
    ownerId: 7
  };

  it("should accept a fully filled contact", async () => {
    await expect(schema.validate(validContact)).resolves.toBeTruthy();
  });

  it("should reject a name with digits", async () => {
    await expect(
      schema.validateAt("name", { ...validContact, name: "Jane 2" })
    ).rejects.toThrow("validations.nameInvalidCharacters");
  });

  it("should require a name", async () => {
    await expect(
      schema.validateAt("name", { ...validContact, name: undefined })
    ).rejects.toThrow("validations.name");
  });

  it("should require an email", async () => {
    await expect(
      schema.validateAt("email", { ...validContact, email: undefined })
    ).rejects.toThrow("validations.email");
  });

  it("should reject a malformed email", async () => {
    await expect(
      schema.validateAt("email", { ...validContact, email: "jane@acme" })
    ).rejects.toThrow("validations.invalidEmail");
  });

  it("should require an owner", async () => {
    await expect(
      schema.validateAt("ownerId", { ...validContact, ownerId: undefined })
    ).rejects.toThrow("validations.owner");
  });

  it("should reject a contact number that is not digits", async () => {
    await expect(
      schema.validateAt("contactNumber", {
        ...validContact,
        contactNumber: "+94 77 123 4567"
      })
    ).rejects.toThrow("validations.contactNumber");
  });

  it("should accept a null or empty contact number and a null company", async () => {
    await expect(
      schema.validate({
        ...validContact,
        contactNumber: null,
        companyId: null
      })
    ).resolves.toBeTruthy();

    await expect(
      schema.validateAt("contactNumber", {
        ...validContact,
        contactNumber: ""
      })
    ).resolves.toBeDefined();
  });
});
