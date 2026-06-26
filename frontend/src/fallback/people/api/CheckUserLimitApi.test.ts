import { useCheckUserLimit } from "./CheckUserLimitApi";

describe("useCheckUserLimit", () => {
  it("should return data as false and isSuccess as true for enterprise mode", () => {
    const result = useCheckUserLimit(true);
    expect(result).toEqual({
      data: false,
      isSuccess: true
    });
  });

  it("should return data as false and isSuccess as true for non-enterprise mode", () => {
    const result = useCheckUserLimit(false);
    expect(result).toEqual({
      data: false,
      isSuccess: true
    });
  });
});
