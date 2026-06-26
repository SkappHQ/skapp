import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { SessionProvider } from "next-auth/react";

import MockTheme from "~community/common/mocks/MockTheme";

import TimesheetDailyRecordTable from "./TimesheetDailyRecordTable";

// Mock the useTranslator hook
jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (keys: string[]) => keys.join(".")
}));

const queryClient = new QueryClient();

beforeEach(() => {
  global.fetch = jest.fn();
});

describe("TimesheetDailyRecordTable", () => {
  it("renders without crashing", () => {
    render(
      <SessionProvider
        session={{
          user: {
            id: "123",
            name: "Mock User",
            email: "mockuser@example.com",
            expires: "2024-01-01T00:00:00.000Z"
          },
          expires: "2024-01-01T00:00:00.000Z"
        }}
      >
        <QueryClientProvider client={queryClient}>
          <MockTheme>
            <TimesheetDailyRecordTable />
          </MockTheme>
        </QueryClientProvider>
      </SessionProvider>
    );
  });
});
