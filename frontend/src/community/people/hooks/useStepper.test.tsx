import { act, renderHook } from "@testing-library/react";

import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";

import { usePeopleStore } from "../store/store";
import { EditPeopleFormTypes } from "../types/PeopleEditTypes";
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
  const mockSetCurrentStep = jest.fn();
  const mockSetNextStep = jest.fn();
  const mockTranslateText = jest.fn((keys) => keys[0]);

  const mockStore = (activeStep: number) => ({
    activeStep,
    setActiveStep: mockSetActiveStep,
    setCurrentStep: mockSetCurrentStep,
    setNextStep: mockSetNextStep
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (usePeopleStore as jest.Mock).mockReturnValue(mockStore(0));
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
    expect(mockSetCurrentStep).toHaveBeenCalledWith(
      EditPeopleFormTypes.emergency
    );
    expect(mockSetNextStep).toHaveBeenCalledWith(EditPeopleFormTypes.emergency);
  });

  it("should not go beyond the last step", () => {
    (usePeopleStore as jest.Mock).mockReturnValue(mockStore(4));

    const { result } = renderHook(() => useStepper());

    act(() => {
      result.current.handleNext();
    });

    expect(mockSetActiveStep).not.toHaveBeenCalledWith(5);
  });

  it("should not change the section on the entitlements step", () => {
    (usePeopleStore as jest.Mock).mockReturnValue(mockStore(3));

    const { result } = renderHook(() => useStepper());

    act(() => {
      result.current.handleNext();
    });

    expect(mockSetActiveStep).toHaveBeenCalledWith(4);
    expect(mockSetCurrentStep).not.toHaveBeenCalled();
    expect(mockSetNextStep).not.toHaveBeenCalled();
  });

  it("should handle previous step correctly", () => {
    (usePeopleStore as jest.Mock).mockReturnValue(mockStore(2));

    const { result } = renderHook(() => useStepper());

    act(() => {
      result.current.handleBack();
    });

    expect(mockSetActiveStep).toHaveBeenCalledWith(1);
    expect(mockSetCurrentStep).toHaveBeenCalledWith(
      EditPeopleFormTypes.emergency
    );
    expect(mockSetNextStep).toHaveBeenCalledWith(EditPeopleFormTypes.emergency);
  });

  it("should not go below the first step", () => {
    const { result } = renderHook(() => useStepper());

    act(() => {
      result.current.handleBack();
    });

    expect(mockSetActiveStep).not.toHaveBeenCalledWith(-1);
  });
});
