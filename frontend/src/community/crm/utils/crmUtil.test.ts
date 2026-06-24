import {
  findById,
  formatValue,
  groupItemsByPriority,
  toDropdownOptions,
  toSelectedDropdownOption
} from "./crmUtil";

interface TestItem {
  id: number;
  name: string;
}

interface TestUser {
  employeeId: number;
  firstName: string;
  lastName: string;
}

describe("formatValue", () => {
  it("should format numeric strings as currency", () => {
    expect(formatValue("1200")).toBe("$1200.00");
    expect(formatValue("99.9")).toBe("$99.90");
  });

  it("should return a placeholder for null and empty values", () => {
    expect(formatValue(null)).toBe("-");
    expect(formatValue("")).toBe("-");
  });
});

describe("toDropdownOptions", () => {
  it("should convert an array of items to DropdownOption array", () => {
    const items: TestItem[] = [
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
      { id: 3, name: "Item 3" }
    ];

    const result = toDropdownOptions(
      items.map((i) => ({ id: i.id, label: i.name }))
    );

    expect(result).toEqual([
      { id: 1, value: 1, label: "Item 1" },
      { id: 2, value: 2, label: "Item 2" },
      { id: 3, value: 3, label: "Item 3" }
    ]);
  });

  it("should return empty array for empty input", () => {
    const result = toDropdownOptions([]);

    expect(result).toEqual([]);
  });

  it("should work with different id/label accessors", () => {
    const users: TestUser[] = [
      { employeeId: 42, firstName: "John", lastName: "Doe" }
    ];

    const result = toDropdownOptions(
      users.map((u) => ({
        id: u.employeeId,
        label: `${u.firstName} ${u.lastName}`
      }))
    );

    expect(result).toEqual([
      {
        id: 42,
        value: 42,
        label: "John Doe"
      }
    ]);
  });

  it("should handle string ids", () => {
    const items = [{ id: "abc-123", name: "String ID Item" }];

    const result = toDropdownOptions(
      items.map((i) => ({ id: i.id, label: i.name }))
    );

    expect(result).toEqual([
      {
        id: "abc-123",
        value: "abc-123",
        label: "String ID Item"
      }
    ]);
  });
});

describe("toSelectedDropdownOption", () => {
  it("should convert a non-null item to DropdownOption", () => {
    const item: TestItem = { id: 5, name: "Selected" };

    const result = toSelectedDropdownOption({ id: item.id, label: item.name });

    expect(result).toEqual({
      id: 5,
      value: 5,
      label: "Selected"
    });
  });

  it("should return null for null input", () => {
    const result = toSelectedDropdownOption(null);

    expect(result).toBeNull();
  });
});

describe("groupItemsByPriority", () => {
  const items: TestItem[] = [
    { id: 1, name: "First" },
    { id: 2, name: "Second" },
    { id: 3, name: "Third" }
  ];

  it("should split prioritized and deprioritized items", () => {
    const result = groupItemsByPriority(items, [3, 1]);

    expect(result).toEqual({
      prioritized: [
        { id: 1, name: "First" },
        { id: 3, name: "Third" }
      ],
      deprioritized: [{ id: 2, name: "Second" }]
    });
  });

  it("should compare priority ids against string item ids", () => {
    const stringItems = [
      { id: "1", name: "First" },
      { id: "2", name: "Second" }
    ];

    const result = groupItemsByPriority(stringItems, [2]);

    expect(result).toEqual({
      prioritized: [{ id: "2", name: "Second" }],
      deprioritized: [{ id: "1", name: "First" }]
    });
  });

  it("should return all items as deprioritized when no priority ids match", () => {
    const result = groupItemsByPriority(items, []);

    expect(result).toEqual({
      prioritized: [],
      deprioritized: items
    });
  });
});

describe("findById", () => {
  const items: TestItem[] = [
    { id: 1, name: "First" },
    { id: 2, name: "Second" },
    { id: 3, name: "Third" }
  ];

  it("should find item by id", () => {
    const result = findById(items, 2, getId);

    expect(result).toEqual({ id: 2, name: "Second" });
  });

  it("should return null when id not found", () => {
    const result = findById(items, 999, getId);

    expect(result).toBeNull();
  });

  it("should work with different id accessor", () => {
    const users: TestUser[] = [
      { employeeId: 10, firstName: "Alice", lastName: "Smith" },
      { employeeId: 20, firstName: "Bob", lastName: "Jones" }
    ];

    const result = findById(users, 20, getUserId);

    expect(result).toEqual({
      employeeId: 20,
      firstName: "Bob",
      lastName: "Jones"
    });
  });

  it("should return null for empty array", () => {
    const result = findById([], 1, getId);

    expect(result).toBeNull();
  });
});
