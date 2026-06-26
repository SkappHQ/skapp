import { act, renderHook } from "@testing-library/react";

import useS3Download from "./useS3Download";

describe("useS3Download", () => {
  it("returns an initial empty s3FileUrls object", () => {
    const { result } = renderHook(() => useS3Download());
    expect(result.current.s3FileUrls).toEqual({});
  });

  it("provides a downloadS3File function", () => {
    const { result } = renderHook(() => useS3Download());
    expect(typeof result.current.downloadS3File).toBe("function");
  });

  it("calls downloadS3File without errors", () => {
    const { result } = renderHook(() => useS3Download());
    act(() => {
      result.current.downloadS3File("test-key");
    });
    // No errors should occur
  });
});
