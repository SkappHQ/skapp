import { useGetGlobalLoginMethod } from "./GlobalLoginMethodApi";

describe("useGetGlobalLoginMethod", () => {
  it("should return an empty string for enterprise mode with a valid tenant name", () => {
    const result = useGetGlobalLoginMethod(true, "tenant1");
    expect(result).toEqual({
      data: ""
    });
  });

  it("should return an empty string for non-enterprise mode with a valid tenant name", () => {
    const result = useGetGlobalLoginMethod(false, "tenant1");
    expect(result).toEqual({
      data: ""
    });
  });

  it("should return an empty string for enterprise mode with an empty tenant name", () => {
    const result = useGetGlobalLoginMethod(true, "");
    expect(result).toEqual({
      data: ""
    });
  });

  it("should return an empty string for non-enterprise mode with an empty tenant name", () => {
    const result = useGetGlobalLoginMethod(false, "");
    expect(result).toEqual({
      data: ""
    });
  });
});
