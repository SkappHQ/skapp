import { type DropdownListType } from "../../types/CommonTypes";
import { handleMultipleSelectedValues } from "../inputSelectHandler";

describe("handleMultipleSelectedValues", () => {
  const itemList: DropdownListType[] = [
    { value: 1, label: "Item 1" },
    { value: 2, label: "Item 2" },
    { value: 3, label: "Item 3" }
  ];

  it("should return selected values with all details when values match items in the list", () => {
    const values = [1, 3];
    const result = handleMultipleSelectedValues(values, itemList);
    expect(result).toEqual([
      { value: 1, label: "Item 1" },
      { value: 3, label: "Item 3" }
    ]);
  });

  it("should return an empty array when no values match items in the list", () => {
    const values = [4, 5];
    const result = handleMultipleSelectedValues(values, itemList);
    expect(result).toEqual([]);
  });

  it("should handle an empty values array and return an empty array", () => {
    const values: Array<string | number> = [];
    const result = handleMultipleSelectedValues(values, itemList);
    expect(result).toEqual([]);
  });

  it("should handle an empty itemList and return an empty array", () => {
    const values = [1, 2];
    const result = handleMultipleSelectedValues(values, []);
    expect(result).toEqual([]);
  });

  it("should handle mixed types of values (string and number) and match correctly", () => {
    const mixedItemList: DropdownListType[] = [
      { value: "1", label: "Item 1" },
      { value: 2, label: "Item 2" }
    ];
    const values = ["1", 2];
    const result = handleMultipleSelectedValues(values, mixedItemList);
    expect(result).toEqual([
      { value: "1", label: "Item 1" },
      { value: 2, label: "Item 2" }
    ]);
  });
});
