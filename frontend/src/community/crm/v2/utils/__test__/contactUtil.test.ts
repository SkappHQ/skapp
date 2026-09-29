import { characterLengths } from "~community/common/constants/stringConstants";
import { ADD_NEW_COMPANY_OPTION_ID } from "~community/crm/v2/constants/contactConstants";
import { CrmCompanyEntity } from "~community/crm/v2/types/CrmCommonTypes";
import {
  getCompanyOptions,
  getContactDisplayName
} from "~community/crm/v2/utils/contactUtil";

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

describe("getContactDisplayName", () => {
  it("joins first and last name with a single space", () => {
    expect(
      getContactDisplayName({ firstName: "Mary", lastName: "Jane Watson" })
    ).toBe("Mary Jane Watson");
  });

  it("shows the first name alone, with no trailing space, when last name is missing", () => {
    expect(getContactDisplayName({ firstName: "Cher" })).toBe("Cher");
    expect(getContactDisplayName({ firstName: "Cher", lastName: "" })).toBe(
      "Cher"
    );
  });

  it("keeps internal spaces in the first name", () => {
    expect(
      getContactDisplayName({ firstName: "Jean Luc", lastName: "Picard" })
    ).toBe("Jean Luc Picard");
  });

  it("is blank when both names are empty", () => {
    expect(getContactDisplayName({ firstName: "", lastName: "" })).toBe("");
    expect(getContactDisplayName({})).toBe("");
  });

  it("is blank when there is no contact", () => {
    expect(getContactDisplayName(undefined)).toBe("");
  });

  it("uses the legacy single name while the backend still sends it", () => {
    expect(
      getContactDisplayName({
        name: "Legacy Name",
        firstName: "Mary",
        lastName: "Watson"
      })
    ).toBe("Legacy Name");
  });
});
