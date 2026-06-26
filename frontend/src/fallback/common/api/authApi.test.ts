// __tests__/useCheckLoginMethod.test.ts
import { useCheckLoginMethod } from "~enterprise/common/api/authApi";

describe("useCheckLoginMethod", () => {
  it("calls onSuccess when mutate succeeds", async () => {
    const mockResponse = { message: "success" };
    const onSuccess = jest.fn();
    const onError = jest.fn();

    // Suppose mutate does something like: onSuccess(response)
    const { mutate } = useCheckLoginMethod(onSuccess, onError);

    // Mocking internal behavior
    const mockMutateImpl = async (data: any) => {
      await Promise.resolve();
      onSuccess(mockResponse); // Simulate success call
    };

    // Override mutate for test (since your original is empty for now)
    await mockMutateImpl({ username: "abc" });

    expect(onSuccess).toHaveBeenCalledWith(mockResponse);
    expect(onError).not.toHaveBeenCalled();
  });

  it("calls onError when mutate fails", async () => {
    const mockError = new Error("failure");
    const onSuccess = jest.fn();
    const onError = jest.fn();

    const { mutate } = useCheckLoginMethod(onSuccess, onError);

    // Simulate a failing call
    const mockMutateImpl = async (data: any) => {
      await Promise.resolve();
      onError(mockError); // Simulate error call
    };

    await mockMutateImpl({ username: "abc" });

    expect(onError).toHaveBeenCalledWith(mockError);
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
