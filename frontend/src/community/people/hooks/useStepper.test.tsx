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

type StepTransition = [number, number, EditPeopleFormTypes];

const forwardSteps: StepTransition[] = [
  [0, 1, EditPeopleFormTypes.emergency],
  [1, 2, EditPeopleFormTypes.employment],
  [2, 3, EditPeopleFormTypes.permission]
];

const backwardSteps: StepTransition[] = [
  [4, 3, EditPeopleFormTypes.permission],
  [3, 2, EditPeopleFormTypes.employment],
  [2, 1, EditPeopleFormTypes.emergency],
  [1, 0, EditPeopleFormTypes.personal]
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
    (activeStep, expectedStep, expectedSection) => {
      (usePeopleStore as jest.Mock).mockReturnValue(mockStore(activeStep));

      const { result } = renderHook(() => useStepper());

      act(() => {
        result.current.handleNext();
      });

      expect(mockSetActiveStep).toHaveBeenCalledWith(expectedStep);
      expect(mockSetCurrentStep).toHaveBeenCalledWith(expectedSection);
      expect(mockSetNextStep).toHaveBeenCalledWith(expectedSection);
    }
  );

  it("should not go beyond the last step", () => {
    (usePeopleStore as jest.Mock).mockReturnValue(mockStore(4));

    const { result } = renderHook(() => useStepper());

    act(() => {
      result.current.handleNext();
    });

    expect(mockSetActiveStep).toHaveBeenCalledWith(4);
    expect(mockSetActiveStep).not.toHaveBeenCalledWith(5);
  });

  // Entitlements has no EditPeopleFormTypes member, so stepSections has no
  // entry for index 4 and the section stays on system permissions.
  it("should not change the section when moving to the entitlements step", () => {
    (usePeopleStore as jest.Mock).mockReturnValue(mockStore(3));

    const { result } = renderHook(() => useStepper());

    act(() => {
      result.current.handleNext();
    });

    expect(mockSetActiveStep).toHaveBeenCalledWith(4);
    expect(mockSetCurrentStep).not.toHaveBeenCalled();
    expect(mockSetNextStep).not.toHaveBeenCalled();
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

    expect(mockSetActiveStep).toHaveBeenCalledWith(3);
    expect(mockSetActiveStep).not.toHaveBeenCalledWith(4);
  });

  it.each(backwardSteps)(
    "should handle the previous step correctly from step %i",
    (activeStep, expectedStep, expectedSection) => {
      (usePeopleStore as jest.Mock).mockReturnValue(mockStore(activeStep));

      const { result } = renderHook(() => useStepper());

      act(() => {
        result.current.handleBack();
      });

      expect(mockSetActiveStep).toHaveBeenCalledWith(expectedStep);
      expect(mockSetCurrentStep).toHaveBeenCalledWith(expectedSection);
      expect(mockSetNextStep).toHaveBeenCalledWith(expectedSection);
    }
  );

  it("should not go below the first step", () => {
    const { result } = renderHook(() => useStepper());

    act(() => {
      result.current.handleBack();
    });

    expect(mockSetActiveStep).toHaveBeenCalledWith(0);
    expect(mockSetActiveStep).not.toHaveBeenCalledWith(-1);
    expect(mockSetCurrentStep).toHaveBeenCalledWith(
      EditPeopleFormTypes.personal
    );
    expect(mockSetNextStep).toHaveBeenCalledWith(EditPeopleFormTypes.personal);
  });
});
