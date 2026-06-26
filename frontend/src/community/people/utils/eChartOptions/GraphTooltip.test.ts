import GraphTooltip from "./GraphTooltip";

describe("GraphTooltip", () => {
  it("should return a tooltip string with the correct value and label", () => {
    const result = GraphTooltip(100, "Test Label");
    expect(result).toContain("100");
    expect(result).toContain("Test Label");
  });
});
