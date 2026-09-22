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

type StepTransition = [number, number];

const forwardSteps: StepTransition[] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4]
];

const backwardSteps: StepTransition[] = [
  [4, 3],
  [3, 2],
  [2, 1],
  [1, 0]
];

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

  it("should flag the entitlements step as the last step when leave module is enabled", () => {
    (usePeopleStore as jest.Mock).mockReturnValue(mockStore(3));

    const { result, rerender } = renderHook(() => useStepper());

    expect(result.current.isLastStep).toBe(false);

    (usePeopleStore as jest.Mock).mockReturnValue(mockStore(4));
    rerender();

    expect(result.current.isLastStep).toBe(true);
  });

  it("should flag the system permissions step as the last step when leave module is disabled", () => {
    (useSessionData as jest.Mock).mockReturnValue({
      isLeaveModuleEnabled: false
    });
    (usePeopleStore as jest.Mock).mockReturnValue(mockStore(3));

    const { result } = renderHook(() => useStepper());

    expect(result.current.isLastStep).toBe(true);
  });

  it.each(forwardSteps)(
    "should handle the next step correctly from step %i",
    (activeStep, expectedStep) => {
      (usePeopleStore as jest.Mock).mockReturnValue(mockStore(activeStep));

      const { result } = renderHook(() => useStepper());

      act(() => {
        result.current.handleNext();
      });

      expect(mockSetActiveStep).toHaveBeenCalledWith(expectedStep);
    }
  );

  it.each(backwardSteps)(
    "should handle the previous step correctly from step %i",
    (activeStep, expectedStep) => {
      (usePeopleStore as jest.Mock).mockReturnValue(mockStore(activeStep));

      const { result } = renderHook(() => useStepper());

      act(() => {
        result.current.handleBack();
      });

      expect(mockSetActiveStep).toHaveBeenCalledWith(expectedStep);
    }
  );

  it("should never write the edit flow section state", () => {
    (usePeopleStore as jest.Mock).mockReturnValue(mockStore(1));

    const { result } = renderHook(() => useStepper());

    act(() => {
      result.current.handleNext();
      result.current.handleBack();
    });

    expect(mockSetCurrentStep).not.toHaveBeenCalled();
    expect(mockSetNextStep).not.toHaveBeenCalled();
  });

  it("should not go beyond the last step", () => {
    (usePeopleStore as jest.Mock).mockReturnValue(mockStore(4));

    const { result } = renderHook(() => useStepper());

    act(() => {
      result.current.handleNext();
    });

    expect(mockSetActiveStep).not.toHaveBeenCalled();
  });

  it("should not go beyond the system permissions step when leave module is disabled", () => {
    (useSessionData as jest.Mock).mockReturnValue({
      isLeaveModuleEnabled: false
    });
    (usePeopleStore as jest.Mock).mockReturnValue(mockStore(3));

    const { result } = renderHook(() => useStepper());

    act(() => {
      result.current.handleNext();
    });

    expect(mockSetActiveStep).not.toHaveBeenCalled();
  });

  it("should not go below the first step", () => {
    const { result } = renderHook(() => useStepper());

    act(() => {
      result.current.handleBack();
    });

    expect(mockSetActiveStep).not.toHaveBeenCalled();
  });
});
