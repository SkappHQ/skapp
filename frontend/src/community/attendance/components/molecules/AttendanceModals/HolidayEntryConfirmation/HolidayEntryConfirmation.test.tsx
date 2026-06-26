import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import MockTheme from "~community/common/mocks/MockTheme";

import HolidayEntryConfirmation from "./HolidayEntryConfirmation";

// Mock hooks and functions
jest.mock("~community/attendance/store/attendanceStore", () => ({
  useAttendanceStore: jest.fn(() => ({
    timeAvailabilityForPeriod: {
      holiday: [{ holidayDuration: "FULL_DAY" }],
      date: "2023-10-01"
    },
    setIsEmployeeTimesheetModalOpen: jest.fn(),
    setEmployeeTimesheetModalType: jest.fn()
  }))
}));

jest.mock("~community/attendance/api/AttendanceEmployeeApi", () => ({
  useAddManualTimeEntry: jest.fn(() => ({
    mutate: jest.fn()
  }))
}));

jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (key: string[]) => key[key.length - 1]
}));

jest.mock("~community/common/providers/ToastProvider", () => ({
  useToast: jest.fn(() => ({
    setToastMessage: jest.fn()
  }))
}));

describe("HolidayEntryConfirmation", () => {
  const mockFromDateTime = "2023-10-01T08:00:00Z";
  const mockToDateTime = "2023-10-01T17:00:00Z";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("reopens time entry modal when cancel button is clicked", async () => {
    const mockSetIsEmployeeTimesheetModalOpen = jest.fn();
    const mockSetEmployeeTimesheetModalType = jest.fn();
    jest
      .mocked(
        require("~community/attendance/store/attendanceStore")
          .useAttendanceStore
      )
      .mockReturnValue({
        setIsEmployeeTimesheetModalOpen: mockSetIsEmployeeTimesheetModalOpen,
        setEmployeeTimesheetModalType: mockSetEmployeeTimesheetModalType,
        timeAvailabilityForPeriod: {
          holiday: [{ holidayDuration: "FULL_DAY" }],
          date: "2023-10-01"
        }
      });

    const user = userEvent.setup();
    render(
      <MockTheme>
        <HolidayEntryConfirmation
          fromDateTime={mockFromDateTime}
          toDateTime={mockToDateTime}
        />
      </MockTheme>
    );

    const cancelButton = screen.getByText("cancelBtnTxt");
    await user.click(cancelButton);

    expect(mockSetIsEmployeeTimesheetModalOpen).toHaveBeenCalledWith(true);
    expect(mockSetEmployeeTimesheetModalType).toHaveBeenCalledWith(
      "ADD_TIME_ENTRY"
    );
  });
});
