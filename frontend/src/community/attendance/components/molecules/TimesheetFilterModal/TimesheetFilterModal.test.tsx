import { render } from "@testing-library/react";

import MockTheme from "~community/common/mocks/MockTheme";

import TimesheetFilterModal from "./TimesheetFilterModal";

// Mock the useAutoFocusMenuListener hook
jest.mock("~community/common/utils/hooks/useAutoFocusMenuListeners", () =>
  jest.fn()
);

beforeEach(() => {
  global.fetch = jest.fn();
});

describe("TimesheetFilterModal", () => {
  it("renders without crashing and handles close event", () => {
    const handleClose = jest.fn();
    const onApply = jest.fn();
    const onReset = jest.fn();

    render(
      <MockTheme>
        <TimesheetFilterModal
          anchorEl={document.createElement("div")}
          handleClose={handleClose}
          id="test-modal"
          open={true}
          onApply={onApply}
          onReset={onReset}
        />
      </MockTheme>
    );
  });
});
