import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import MockTheme from "~community/common/mocks/MockTheme";

import PreMidnightClockOutAlertModal from "./PreMidnightClockOutAlertModal";

// Mock useTranslator
jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (key: string[]) => key[key.length - 1]
}));

describe("PreMidnightClockOutAlertModal", () => {
  const mockCloseModal = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders modal with correct elements", () => {
    render(
      <MockTheme>
        <PreMidnightClockOutAlertModal closeModal={mockCloseModal} />
      </MockTheme>
    );

    expect(screen.getByText("clockOutAlert")).toBeInTheDocument();
    expect(screen.getByText("clockOutAlertMessage")).toBeInTheDocument();
    expect(screen.getByText("ok")).toBeInTheDocument();
  });

  test("calls closeModal when OK button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <MockTheme>
        <PreMidnightClockOutAlertModal closeModal={mockCloseModal} />
      </MockTheme>
    );

    const okButton = screen.getByText("ok");
    await user.click(okButton);

    expect(mockCloseModal).toHaveBeenCalledTimes(1);
  });
});
