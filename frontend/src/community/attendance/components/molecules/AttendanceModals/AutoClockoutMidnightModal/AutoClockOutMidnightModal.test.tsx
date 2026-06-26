import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import MockTheme from "~community/common/mocks/MockTheme";

import AutoClockOutMidnightModal from "./AutoClockOutMidnightModal";

// Mock hooks and functions
jest.mock("~community/attendance/store/attendanceStore", () => ({
  useAttendanceStore: jest.fn(() => ({
    setSlotType: jest.fn(),
    attendanceParams: {}
  }))
}));

jest.mock("~community/attendance/api/AttendanceApi", () => ({
  useUpdateEmployeeStatus: jest.fn(() => ({
    isPending: false,
    mutate: jest.fn()
  }))
}));

jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (key: string[]) => key[key.length - 1]
}));

describe("AutoClockOutMidnightModal", () => {
  const mockCloseModal = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders modal with correct elements", () => {
    render(
      <MockTheme>
        <AutoClockOutMidnightModal closeModal={mockCloseModal} />
      </MockTheme>
    );

    expect(screen.getByText("autoClockedOutMessage")).toBeInTheDocument();
    expect(screen.getByText("clockOutTime:")).toBeInTheDocument();
    expect(screen.getByText("workedHours:")).toBeInTheDocument();
    expect(screen.getByText("clockInAgain")).toBeInTheDocument();
    expect(screen.getByText("cancel")).toBeInTheDocument();
  });

  test("calls closeModal when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <MockTheme>
        <AutoClockOutMidnightModal closeModal={mockCloseModal} />
      </MockTheme>
    );

    const cancelButton = screen.getByText("cancel");
    await user.click(cancelButton);

    expect(mockCloseModal).toHaveBeenCalledTimes(1);
  });

  test("calls mutate and closeModal when clockInAgain button is clicked", async () => {
    const mockMutate = jest.fn();
    jest
      .mocked(
        require("~community/attendance/api/AttendanceApi")
          .useUpdateEmployeeStatus
      )
      .mockReturnValue({
        isPending: false,
        mutate: mockMutate
      });

    const user = userEvent.setup();
    render(
      <MockTheme>
        <AutoClockOutMidnightModal closeModal={mockCloseModal} />
      </MockTheme>
    );

    const clockInAgainButton = screen.getByText("clockInAgain");
    await user.click(clockInAgainButton);

    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockCloseModal).toHaveBeenCalledTimes(1);
  });
});
