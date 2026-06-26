import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render } from "@testing-library/react";
import { SessionProvider } from "next-auth/react";

import MockTheme from "~community/common/mocks/MockTheme";

import TimeSheetFilters from "./TimeSheetFilters";

// Mock the useTranslator hook
jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (keys: string[]) => keys.join(".")
}));

beforeEach(() => {
  global.fetch = jest.fn();
});

const queryClient = new QueryClient();

describe("TimeSheetFilters", () => {
  it("renders without crashing and handles tab selection", () => {
    const setSelectedTab = jest.fn();

    const { getByText } = render(
      <MockTheme>
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
            <TimeSheetFilters
              selectedTab="week"
              setSelectedTab={setSelectedTab}
              isTeamSelectionAvailable={true}
            />
          </QueryClientProvider>
        </SessionProvider>
      </MockTheme>
    );

    const weekTab = getByText("weekTabTxt");
    const monthTab = getByText("monthTabTxt");

    fireEvent.click(monthTab);
    expect(setSelectedTab).toHaveBeenCalledWith("month");

    fireEvent.click(weekTab);
    expect(setSelectedTab).toHaveBeenCalledWith("week");
  });
});
