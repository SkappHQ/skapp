import { buildContactOptions, buildOwnerOptions } from "./dealUtil";

interface TestOwner {
  employeeId: number;
  firstName: string;
  lastName: string | null;
}

interface TestContact {
  id: number;
  name: string;
  company?: {
    id: number;
    name: string;
  } | null;
}

const getOwnerLabel = (owner: TestOwner): string =>
  [owner.firstName, owner.lastName ?? ""].join(" ").trim();

describe("buildOwnerOptions", () => {
  const owners: TestOwner[] = [
    { employeeId: 1, firstName: "Alex", lastName: "Stone" },
    { employeeId: 2, firstName: "Sam", lastName: null }
  ];

  it("should build owner dropdown options", () => {
    const result = buildOwnerOptions(owners, null, getOwnerLabel);

    expect(result).toEqual([
      { id: 1, value: 1, label: "Alex Stone" },
      { id: 2, value: 2, label: "Sam" }
    ]);
  });

  it("should prepend the selected owner when it is missing from the lookup", () => {
    const selectedOwner: TestOwner = {
      employeeId: 3,
      firstName: "Taylor",
      lastName: "Reed"
    };

    const result = buildOwnerOptions(owners, selectedOwner, getOwnerLabel);

    expect(result).toEqual([
      { id: 3, value: 3, label: "Taylor Reed" },
      { id: 1, value: 1, label: "Alex Stone" },
      { id: 2, value: 2, label: "Sam" }
    ]);
  });

  it("should not duplicate the selected owner when it exists in the lookup", () => {
    const result = buildOwnerOptions(owners, owners[0], getOwnerLabel);

    expect(result).toEqual([
      { id: 1, value: 1, label: "Alex Stone" },
      { id: 2, value: 2, label: "Sam" }
    ]);
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
