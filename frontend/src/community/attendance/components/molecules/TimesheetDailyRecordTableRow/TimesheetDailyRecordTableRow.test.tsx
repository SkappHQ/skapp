import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";

import { DailyLogType } from "~community/attendance/types/timeSheetTypes";
import { daysTypes } from "~community/common/constants/stringConstants";
import MockTheme from "~community/common/mocks/MockTheme";

import TimesheetDailyRecordTableRow from "./TimesheetDailyRecordTableRow";

// Mock the useTranslator hook
jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (keys: string[]) => keys.join(".")
}));

beforeEach(() => {
  global.fetch = jest.fn();
});

const queryClient = new QueryClient();
describe("TimesheetDailyRecordTableRow", () => {
  it("renders without crashing", () => {
    const record: DailyLogType = {
      timeRecordId: null,
      date: "2023-10-01",
      day: daysTypes.SUNDAY,
      workedHours: 8,
      breakHours: 0,
      timeSlots: [],
      leaveRequest: null,
      holiday: null
    };
    render(
      <MockTheme>
        <QueryClientProvider client={queryClient}>
          <TimesheetDailyRecordTableRow
            record={record}
            headerLength={3}
            isRowInteractive={true}
            isManualEntryRestricted={false}
          />
        </QueryClientProvider>
      </MockTheme>
    );
  });
});
