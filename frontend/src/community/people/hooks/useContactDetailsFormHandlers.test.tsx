import { act, renderHook } from "@testing-library/react";

import { usePeopleStore } from "~community/people/store/store";

import useContactDetailsFormHandlers from "./useContactDetailsFormHandlers";

jest.mock("~community/people/store/store", () => ({
  usePeopleStore: jest.fn()
}));

describe("useContactDetailsFormHandlers", () => {
  const mockSetPersonalDetails = jest.fn();
  const mockFormik = {
    setFieldValue: jest.fn(),
    setFieldError: jest.fn(),
    values: { countryCode: "+1" }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (usePeopleStore as jest.Mock).mockReturnValue({
      employee: { personal: { contact: {} } },
      setPersonalDetails: mockSetPersonalDetails
    });
  });

  it("should handle input changes correctly", async () => {
    const { result } = renderHook(() =>
      useContactDetailsFormHandlers({ formik: mockFormik as any })
    );

    await act(async () => {
      await result.current.handleInput({
        target: { name: "personalEmail", value: "test@example.com" }
      } as any);
    });

    expect(mockFormik.setFieldValue).toHaveBeenCalledWith(
      "personalEmail",
      "test@example.com"
    );
    expect(mockFormik.setFieldError).toHaveBeenCalledWith("personalEmail", "");
    expect(mockSetPersonalDetails).toHaveBeenCalled();
  });

  it("should handle country selection correctly", async () => {
    const { result } = renderHook(() =>
      useContactDetailsFormHandlers({ formik: mockFormik as any })
    );

    await act(async () => {
      await result.current.handleCountrySelect({} as any, {
        value: "US",
        label: "United States"
      });
    });

    expect(mockFormik.setFieldValue).toHaveBeenCalledWith("country", "US");
    expect(mockFormik.setFieldError).toHaveBeenCalledWith("country", "");
    expect(mockSetPersonalDetails).toHaveBeenCalled();
  });

  it("should handle phone number changes correctly", async () => {
    const { result } = renderHook(() =>
      useContactDetailsFormHandlers({ formik: mockFormik as any })
    );

    await act(async () => {
      await result.current.onChangePhoneNumber({
        target: { value: "1234567890" }
      } as any);
    });

    expect(mockFormik.setFieldValue).toHaveBeenCalledWith(
      "contactNo",
      "1234567890"
    );
    expect(mockSetPersonalDetails).toHaveBeenCalledWith({
      general: undefined,
      contact: { contactNo: "+1 1234567890" }
    });
  });
});
