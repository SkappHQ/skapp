import { act, renderHook } from "@testing-library/react";

import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";

import { usePeopleStore } from "../store/store";
import useStepper from "./useStepper";

jest.mock("../store/store", () => ({
  usePeopleStore: jest.fn()
}));

jest.mock("~community/common/hooks/useSessionData", () => jest.fn());

jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: jest.fn()
}));

describe("useStepper", () => {
  const mockSetActiveStep = jest.fn();
  const mockTranslateText = jest.fn((keys) => keys[0]);

  beforeEach(() => {
    jest.clearAllMocks();
    (usePeopleStore as jest.Mock).mockReturnValue({
      activeStep: 0,
      setActiveStep: mockSetActiveStep
    });
    (useSessionData as jest.Mock).mockReturnValue({
      isLeaveModuleEnabled: true
    });
    (useTranslator as jest.Mock).mockReturnValue(mockTranslateText);
  });

  it("should initialize steps correctly when leave module is enabled", () => {
    const { result } = renderHook(() => useStepper());

    expect(result.current.steps).toEqual([
      "personal",
      "emergency",
      "employment",
      "systemPermissions",
      "entitlements"
    ]);
  });

  it("should initialize steps correctly when leave module is disabled", () => {
    (useSessionData as jest.Mock).mockReturnValue({
      isLeaveModuleEnabled: false
    });

    const { result } = renderHook(() => useStepper());

    expect(result.current.steps).toEqual([
      "personal",
      "emergency",
      "employment",
      "systemPermissions"
    ]);
  });

  it("should handle next step correctly", () => {
    const { result } = renderHook(() => useStepper());

    act(() => {
      result.current.handleNext();
    });

    expect(mockSetActiveStep).toHaveBeenCalledWith(1);
  });

  it("should not go beyond the last step", () => {
    (usePeopleStore as jest.Mock).mockReturnValue({
      activeStep: 4,
      setActiveStep: mockSetActiveStep
    });

    const { result } = renderHook(() => useStepper());

    act(() => {
      result.current.handleNext();
    });

    expect(mockSetActiveStep).not.toHaveBeenCalledWith(5);
  });

  it("should handle previous step correctly", () => {
    (usePeopleStore as jest.Mock).mockReturnValue({
      activeStep: 2,
      setActiveStep: mockSetActiveStep
    });

    const { result } = renderHook(() => useStepper());

    act(() => {
      result.current.handleBack();
    });

    expect(mockSetActiveStep).toHaveBeenCalledWith(1);
  });

  it("should not go below the first step", () => {
    const { result } = renderHook(() => useStepper());

    act(() => {
      result.current.handleBack();
    });

    expect(mockSetActiveStep).not.toHaveBeenCalledWith(-1);
  });
});
