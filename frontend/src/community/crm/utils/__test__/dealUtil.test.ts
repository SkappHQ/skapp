import { concatStrings } from "~community/common/utils/commonUtil";
import { CrmOwner } from "~community/crm/types/CommonTypes";

import { buildContactOptions, buildOwnerOptions } from "../dealUtil";

jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
  NextResponse: { redirect: jest.fn(), next: jest.fn() }
}));

interface TestContact {
  id: number;
  name: string;
  company?: {
    id: number;
    name: string;
  } | null;
}

const getOwnerLabel = (owner: CrmOwner): string =>
  concatStrings([owner.firstName, owner.lastName ?? "", owner.email ?? ""]);

describe("buildOwnerOptions", () => {
  const owners: CrmOwner[] = [
    {
      employeeId: 1,
      firstName: "Alex",
      lastName: "Stone",
      email: "alex.stone@skapp.com",
      authPic: null
    },
    {
      employeeId: 2,
      firstName: "Sam",
      lastName: null,
      email: "sam@skapp.com",
      authPic: null
    }
  ];

  it("should build owner dropdown options", () => {
    const result = buildOwnerOptions(owners, null, getOwnerLabel);

    expect(result).toEqual([
      { id: 1, value: 1, label: "Alex Stone alex.stone@skapp.com" },
      { id: 2, value: 2, label: "Sam  sam@skapp.com" }
    ]);
  });

  it("should include the owner email in the option label", () => {
    const result = buildOwnerOptions(owners, null, getOwnerLabel);

    result.forEach((option, index) => {
      expect(option.label).toContain(owners[index].email as string);
    });
  });

  it("should surface owners when filtering by an email substring", () => {
    const options = buildOwnerOptions(owners, null, getOwnerLabel);
    const searchTerm = "ALEX.STONE@";


    const filtered = options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    expect(filtered).toEqual([
      { id: 1, value: 1, label: "Alex Stone alex.stone@skapp.com" }
    ]);
  });

  it("should prepend the selected owner when it is missing from the lookup", () => {
    const selectedOwner: CrmOwner = {
      employeeId: 3,
      firstName: "Taylor",
      lastName: "Reed",
      email: "taylor.reed@skapp.com",
      authPic: null
    };

    const result = buildOwnerOptions(owners, selectedOwner, getOwnerLabel);

    expect(result).toEqual([
      { id: 3, value: 3, label: "Taylor Reed taylor.reed@skapp.com" },
      { id: 1, value: 1, label: "Alex Stone alex.stone@skapp.com" },
      { id: 2, value: 2, label: "Sam  sam@skapp.com" }
    ]);
  });

  it("should not duplicate the selected owner when it exists in the lookup", () => {
    const result = buildOwnerOptions(owners, owners[0], getOwnerLabel);

    expect(result).toEqual([
      { id: 1, value: 1, label: "Alex Stone alex.stone@skapp.com" },
      { id: 2, value: 2, label: "Sam  sam@skapp.com" }
    ]);
  });

  it("should build a label without email when the owner has none", () => {
    const ownerWithoutEmail: CrmOwner = {
      employeeId: 4,
      firstName: "Nora",
      lastName: "Iri",
      authPic: null
    };

    const result = buildOwnerOptions([ownerWithoutEmail], null, getOwnerLabel);

    expect(result[0].label).toContain("Nora Iri");
  });
});

describe("buildContactOptions", () => {
  const contacts: TestContact[] = [
    { id: 10, name: "Acme Buyer", company: { id: 1, name: "Acme" } },
    { id: 20, name: "Beta Lead", company: null }
  ];

  it("should build contact dropdown options with company name in the label", () => {
    const result = buildContactOptions(contacts);

    expect(result).toEqual([
      { id: 10, value: 10, label: "Acme Buyer Acme" },
      { id: 20, value: 20, label: "Beta Lead" }
    ]);
  });

  it("should return empty options for empty input", () => {
    expect(buildContactOptions([])).toEqual([]);
  });
});
