import { characterLengths } from "~community/common/constants/stringConstants";
import { ADD_NEW_COMPANY_OPTION_ID } from "~community/crm/constants/contactConstants";
import {
  CrmCompanyEntity,
  CrmContactRecord
} from "~community/crm/types/CrmCommonTypes";
import {
  getCompanyOptions,
  getFieldsAddingOtherCompany,
  toContactOption
} from "~community/crm/utils/contactUtil";

const lookupCompanies: CrmCompanyEntity[] = [
  { id: 1, name: "Acme" },
  { id: 2, name: "Nova Labs" }
];

const getAddOption = (options: { id: string; name?: string }[]) =>
  options.find((option) => option.id === ADD_NEW_COMPANY_OPTION_ID);

describe("getCompanyOptions add-new prompt", () => {
  it("is absent when no name is being offered", () => {
    const options = getCompanyOptions(lookupCompanies, undefined);

    expect(getAddOption(options)).toBeUndefined();
    expect(options).toHaveLength(2);
  });

  it("is appended last so it sits at the bottom of the dropdown", () => {
    const options = getCompanyOptions(lookupCompanies, undefined, "Nova");

    expect(options[options.length - 1]?.id).toBe(ADD_NEW_COMPANY_OPTION_ID);
  });

  it("carries the trimmed name", () => {
    const options = getCompanyOptions(lookupCompanies, undefined, "  Nova  ");

    expect(getAddOption(options)?.name).toBe("Nova");
  });

  it("is hidden when the name already exists, ignoring capitalisation", () => {
    expect(
      getAddOption(getCompanyOptions(lookupCompanies, undefined, "acme"))
    ).toBeUndefined();
    expect(
      getAddOption(getCompanyOptions(lookupCompanies, undefined, "ACME"))
    ).toBeUndefined();
    expect(
      getAddOption(getCompanyOptions(lookupCompanies, undefined, "  AcMe  "))
    ).toBeUndefined();
  });

  it("is shown when the name only partially matches an existing company", () => {
    expect(
      getAddOption(getCompanyOptions(lookupCompanies, undefined, "Nova"))
    ).toBeDefined();
  });

  it("is hidden for blank or whitespace-only input", () => {
    expect(
      getAddOption(getCompanyOptions(lookupCompanies, undefined, ""))
    ).toBeUndefined();
    expect(
      getAddOption(getCompanyOptions(lookupCompanies, undefined, "   "))
    ).toBeUndefined();
  });

  it("is shown at the maximum length and hidden one character past it", () => {
    const maxLengthName = "a".repeat(characterLengths.COMPANY_NAME_LENGTH);
    const tooLongName = "a".repeat(characterLengths.COMPANY_NAME_LENGTH + 1);

    expect(
      getAddOption(getCompanyOptions(lookupCompanies, undefined, maxLengthName))
    ).toBeDefined();
    expect(
      getAddOption(getCompanyOptions(lookupCompanies, undefined, tooLongName))
    ).toBeUndefined();
  });

  it("measures length after trimming, so padding does not push it over", () => {
    const paddedMaxLengthName = ` ${"a".repeat(characterLengths.COMPANY_NAME_LENGTH)} `;

    expect(
      getAddOption(
        getCompanyOptions(lookupCompanies, undefined, paddedMaxLengthName)
      )
    ).toBeDefined();
  });

  it("is shown when there are no companies at all", () => {
    const options = getCompanyOptions(undefined, undefined, "Nova");

    expect(options).toHaveLength(1);
    expect(options[0]?.id).toBe(ADD_NEW_COMPANY_OPTION_ID);
  });

  it("is hidden when the name matches a domain-suggested company", () => {
    const suggested: CrmCompanyEntity[] = [{ id: 9, name: "Suggested Co" }];

    expect(
      getAddOption(
        getCompanyOptions(lookupCompanies, suggested, "suggested co")
      )
    ).toBeUndefined();
  });
});

describe("toContactOption", () => {
  const contacts: CrmContactRecord = {
    5: { id: 5, firstName: "Jane", lastName: "Doe" }
  };

  it("uses the contact id as the value and the display name as the label", () => {
    expect(toContactOption(5, contacts[5])).toEqual({
      value: "5",
      label: "Jane Doe"
    });
  });

  it("keeps the id and gives an empty label when the contact is not in the store", () => {
    expect(toContactOption(7, contacts[7])).toEqual({
      value: "7",
      label: ""
    });
  });
});

describe("getFieldsAddingOtherCompany", () => {
  it("flags no field when every recipient shares one company", () => {
    expect(getFieldsAddingOtherCompany([[1], [1], [1]])).toEqual([
      false,
      false,
      false
    ]);
  });

  it("flags the first field when its own contacts span two companies", () => {
    expect(getFieldsAddingOtherCompany([[1, 2], [1], []])).toEqual([
      true,
      false,
      false
    ]);
  });

  it("flags the field that brings in another company", () => {
    expect(getFieldsAddingOtherCompany([[1], [2], []])).toEqual([
      false,
      true,
      false
    ]);
  });

  it("flags only the last field when the earlier fields share a company", () => {
    expect(getFieldsAddingOtherCompany([[1], [1], [2]])).toEqual([
      false,
      false,
      true
    ]);
  });

  it("flags every field that brings in a new company", () => {
    expect(getFieldsAddingOtherCompany([[1], [2], [3]])).toEqual([
      false,
      true,
      true
    ]);
  });

  it("does not flag the first filled field when the fields above it are empty", () => {
    expect(getFieldsAddingOtherCompany([[], [1], [2]])).toEqual([
      false,
      false,
      true
    ]);
  });
});
