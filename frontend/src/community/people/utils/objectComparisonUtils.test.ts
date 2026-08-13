import { isValueEqual } from "./objectComparisonUtils";

describe("areValuesEqual", () => {
  it("should match identical primitives", () => {
    expect(isValueEqual("Ada", "Ada")).toBe(true);
    expect(isValueEqual(1, 1)).toBe(true);
    expect(isValueEqual(null, null)).toBe(true);
    expect(isValueEqual(undefined, undefined)).toBe(true);
  });

  it("should not match different primitives", () => {
    expect(isValueEqual("Ada", "Grace")).toBe(false);
    expect(isValueEqual(1, 2)).toBe(false);
    expect(isValueEqual(null, undefined)).toBe(false);
    expect(isValueEqual(0, "")).toBe(false);
  });

  it("should match nested objects regardless of key order", () => {
    expect(
      isValueEqual(
        { general: { firstName: "Ada", lastName: "Lovelace" } },
        { general: { lastName: "Lovelace", firstName: "Ada" } }
      )
    ).toBe(true);
  });

  it("should detect a nested value change", () => {
    expect(
      isValueEqual(
        { general: { firstName: "Ada" } },
        { general: { firstName: "Grace" } }
      )
    ).toBe(false);
  });

  it("should treat undefined valued keys as absent", () => {
    expect(
      isValueEqual({ title: undefined, firstName: "" }, { firstName: "" })
    ).toBe(true);
  });

  it("should detect an added key", () => {
    expect(isValueEqual({ firstName: "" }, { firstName: "", nin: "1" })).toBe(
      false
    );
  });

  it("should compare arrays by order and length", () => {
    expect(isValueEqual([1, 2], [1, 2])).toBe(true);
    expect(isValueEqual([1, 2], [2, 1])).toBe(false);
    expect(isValueEqual([], [])).toBe(true);
    expect(isValueEqual([{ a: 1 }], [{ a: 1 }])).toBe(true);
    expect(isValueEqual([{ a: 1 }], [{ a: 2 }])).toBe(false);
  });

  it("should not match an array against an object", () => {
    expect(isValueEqual([], {})).toBe(false);
  });
});
