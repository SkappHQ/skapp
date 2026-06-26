import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import MockTheme from "~community/common/mocks/MockTheme";

import TimeEntryRequestExists from "./TimeEntryRequestExists";

// Mock hooks and functions
jest.mock("~community/attendance/store/attendanceStore", () => ({
  useAttendanceStore: jest.fn(() => ({
    setIsEmployeeTimesheetModalOpen: jest.fn(),
    setEmployeeTimesheetModalType: jest.fn()
  }))
}));

jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (key: string[]) => key[key.length - 1]
}));

describe("TimeEntryRequestExists", () => {
  const mockSetIsEmployeeTimesheetModalOpen = jest.fn();
  const mockSetEmployeeTimesheetModalType = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
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

  test("renders the component with correct text and button", () => {
    render(
      <MockTheme>
        <TimeEntryRequestExists isEdit={false} />
      </MockTheme>
    );

    expect(screen.getByText("requestExistModalDes")).toBeInTheDocument();
    expect(screen.getByText("okayBtnTxt")).toBeInTheDocument();
  });

  test("closes the modal when okay button is clicked and isEdit is true", async () => {
    const user = userEvent.setup();
    render(
      <MockTheme>
        <TimeEntryRequestExists isEdit={true} />
      </MockTheme>
    );

    const okayButton = screen.getByText("okayBtnTxt");
    await user.click(okayButton);

    expect(mockSetIsEmployeeTimesheetModalOpen).toHaveBeenCalledWith(false);
    expect(mockSetEmployeeTimesheetModalType).not.toHaveBeenCalled();
  });

  test("reopens the modal and sets modal type when okay button is clicked and isEdit is false", async () => {
    const user = userEvent.setup();
    render(
      <MockTheme>
        <TimeEntryRequestExists isEdit={false} />
      </MockTheme>
    );

    const okayButton = screen.getByText("okayBtnTxt");
    await user.click(okayButton);

    expect(mockSetIsEmployeeTimesheetModalOpen).toHaveBeenCalledWith(true);
    expect(mockSetEmployeeTimesheetModalType).toHaveBeenCalledWith(
      "ADD_TIME_ENTRY"
    );
  });
});
