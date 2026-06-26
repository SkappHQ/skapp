import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import MockTheme from "~community/common/mocks/MockTheme";

import AreYouSureModal from "./AreYouSureModal";

// Import MockTheme

// Mock useTranslator
jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (key: string[]) => key[key.length - 1]
}));

describe("AreYouSureModal", () => {
  const mockOnPrimaryBtnClick = jest.fn();
  const mockOnSecondaryBtnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the modal with correct text", () => {
    render(
      <MockTheme>
        <AreYouSureModal
          onPrimaryBtnClick={mockOnPrimaryBtnClick}
          onSecondaryBtnClick={mockOnSecondaryBtnClick}
        />
      </MockTheme>
    );

    expect(screen.getByText("description")).toBeInTheDocument();
    expect(screen.getByText("resumeTaskBtn")).toBeInTheDocument();
    expect(screen.getByText("leaveAnywayBtn")).toBeInTheDocument();
  });

  test("calls onPrimaryBtnClick when the primary button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <MockTheme>
        <AreYouSureModal
          onPrimaryBtnClick={mockOnPrimaryBtnClick}
          onSecondaryBtnClick={mockOnSecondaryBtnClick}
        />
      </MockTheme>
    );

    const primaryButton = screen.getByText("resumeTaskBtn");
    await user.click(primaryButton);

    expect(mockOnPrimaryBtnClick).toHaveBeenCalledTimes(1);
  });

  test("calls onSecondaryBtnClick when the secondary button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <MockTheme>
        <AreYouSureModal
          onPrimaryBtnClick={mockOnPrimaryBtnClick}
          onSecondaryBtnClick={mockOnSecondaryBtnClick}
        />
      </MockTheme>
    );

    const secondaryButton = screen.getByText("leaveAnywayBtn");
    await user.click(secondaryButton);

    expect(mockOnSecondaryBtnClick).toHaveBeenCalledTimes(1);
  });
});
