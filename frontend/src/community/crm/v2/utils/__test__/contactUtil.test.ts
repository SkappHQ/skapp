import { characterLengths } from "~community/common/constants/stringConstants";
import { ADD_NEW_COMPANY_OPTION_ID } from "~community/crm/v2/constants/contactConstants";
import { CrmCompanyEntity } from "~community/crm/v2/types/CrmCommonTypes";
import { getCompanyOptions } from "~community/crm/v2/utils/contactUtil";

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
