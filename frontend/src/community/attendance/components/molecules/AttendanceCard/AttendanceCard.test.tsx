import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";

import { ClockInOutGraphTypes } from "~community/attendance/enums/dashboardEnums";
import MockTheme from "~community/common/mocks/MockTheme";

import AttendanceCard from "./AttendanceCard";

// Mock useRouter
jest.mock("next/router", () => ({
  useRouter: () => ({
    replace: jest.fn()
  })
}));

// Mock useAttendanceStore
jest.mock("~community/attendance/store/attendanceStore", () => ({
  useAttendanceStore: jest.fn(() => ({
    setClockInType: jest.fn()
  }))
}));

describe("AttendanceCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders title and analytics correctly", () => {
    render(
      <MockTheme>
        <AttendanceCard
          title="Clock In Summary"
          analytic1={5}
          analytic2={10}
          type={ClockInOutGraphTypes.CLOCK_IN}
        />
      </MockTheme>
    );

    expect(screen.getByText("Clock In Summary")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("/10")).toBeInTheDocument();
  });

  test("renders '--' when analytics are not provided", () => {
    render(
      <MockTheme>
        <AttendanceCard title="No Data" type={ClockInOutGraphTypes.CLOCK_IN} />
      </MockTheme>
    );

    expect(screen.getByText("No Data")).toBeInTheDocument();
    expect(screen.getByText("--")).toBeInTheDocument();
    expect(screen.queryByText("/--")).toBeInTheDocument();
  });
});
