import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import MockTheme from "~community/common/mocks/MockTheme";

import TimeEntryExists from "./TimeEntryExists";

// Mock hooks and functions
jest.mock("~community/attendance/hooks/useAddEntry", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    confirmManualTimeEntry: jest.fn()
  }))
}));

jest.mock("~community/attendance/store/attendanceStore", () => ({
  useAttendanceStore: jest.fn(() => ({
    setIsEmployeeTimesheetModalOpen: jest.fn(),
    setEmployeeTimesheetModalType: jest.fn()
  }))
}));

jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (key: string[]) => key[key.length - 1]
}));

describe("TimeEntryExists", () => {
  const mockSetIsEmployeeTimesheetModalOpen = jest.fn();
  const mockSetEmployeeTimesheetModalType = jest.fn();
  const mockConfirmManualTimeEntry = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .mocked(require("~community/attendance/hooks/useAddEntry").default)
      .mockReturnValue({
        confirmManualTimeEntry: mockConfirmManualTimeEntry
      });
    jest
      .mocked(
        require("~community/attendance/store/attendanceStore")
          .useAttendanceStore
      )
      .mockReturnValue({
        setIsEmployeeTimesheetModalOpen: mockSetIsEmployeeTimesheetModalOpen,
        setEmployeeTimesheetModalType: mockSetEmployeeTimesheetModalType
      });
  });

  const fromDateTime = "2023-10-01T08:00:00";
  const toDateTime = "2023-10-01T17:00:00";

  test("renders the component with correct text and buttons", () => {
    render(
      <MockTheme>
        <TimeEntryExists fromDateTime={fromDateTime} toDateTime={toDateTime} />
      </MockTheme>
    );

    expect(screen.getByText("entryExistModalDes")).toBeInTheDocument();
    expect(screen.getByText("confirmBtnTxt")).toBeInTheDocument();
    expect(screen.getByText("cancelBtnTxt")).toBeInTheDocument();
  });

  test("submits the time entry when confirm button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <MockTheme>
        <TimeEntryExists fromDateTime={fromDateTime} toDateTime={toDateTime} />
      </MockTheme>
    );

    const confirmButton = screen.getByText("confirmBtnTxt");
    await user.click(confirmButton);

    expect(mockConfirmManualTimeEntry).toHaveBeenCalledWith(
      fromDateTime,
      toDateTime
    );
  });

  test("reopens the modal and sets modal type when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <MockTheme>
        <TimeEntryExists fromDateTime={fromDateTime} toDateTime={toDateTime} />
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
