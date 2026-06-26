import { render } from "@testing-library/react";

import MockTheme from "~community/common/mocks/MockTheme";

import TimesheetDailyRecordTableHeader from "./TimesheetDailyRecordTableHeader";

// Mock the useTranslator hook
jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (keys: string[]) => keys.join(".")
}));

describe("TimesheetDailyRecordTableHeader", () => {
  it("renders without crashing", () => {
    const headerLabels = ["Label 1", "Label 2"];
    render(
      <MockTheme>
        <TimesheetDailyRecordTableHeader headerLabels={headerLabels} />
      </MockTheme>
    );
  });
});
