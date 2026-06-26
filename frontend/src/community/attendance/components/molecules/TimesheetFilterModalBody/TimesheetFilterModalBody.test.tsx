import { fireEvent, render } from "@testing-library/react";

import MockTheme from "~community/common/mocks/MockTheme";

import TimesheetFilterModalBody from "./TimesheetFilterModalBody";

// Mock the useTranslator hook
jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (keys: string[]) => keys.join(".")
}));

beforeEach(() => {
  global.fetch = jest.fn();
});

describe("TimesheetFilterModalBody", () => {
  it("renders without crashing and handles apply and reset actions", () => {
    const onApply = jest.fn();
    const onReset = jest.fn();

    const { getByText } = render(
      <MockTheme>
        <TimesheetFilterModalBody onApply={onApply} onReset={onReset} />
      </MockTheme>
    );

    const applyButton = getByText("applyBtnTxt");

    fireEvent.click(applyButton);
  });
});
