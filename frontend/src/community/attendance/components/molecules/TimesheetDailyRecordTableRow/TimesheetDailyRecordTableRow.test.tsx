import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";

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
    const record = {
      date: "2023-10-01",
      workedHours: 8,
      timeSlots: []
    };
    render(
      <MockTheme>
        <QueryClientProvider client={queryClient}>
          <TimesheetDailyRecordTableRow record={record} headerLength={3} />
        </QueryClientProvider>
      </MockTheme>
    );
  });
});
