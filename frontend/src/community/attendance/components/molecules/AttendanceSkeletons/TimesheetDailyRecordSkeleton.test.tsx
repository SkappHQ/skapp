import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";

import MockTheme from "~community/common/mocks/MockTheme";

import TimesheetDailyRecordSkeleton from "./TimesheetDailyRecordSkeleton";

describe("TimesheetDailyRecordSkeleton", () => {
  test("renders the skeleton", () => {
    render(
      <MockTheme>
        <TimesheetDailyRecordSkeleton />
      </MockTheme>
    );
  });
});
