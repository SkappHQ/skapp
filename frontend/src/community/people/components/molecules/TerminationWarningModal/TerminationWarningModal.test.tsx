import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";

import MockTheme from "~community/common/mocks/MockTheme";

import TerminationWarningModal from "./TerminationWarningModal";

// Mock hooks and functions
jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (key: string[]) => key[key.length - 1]
}));

describe("TerminationWarningModal", () => {
  const mockOnClose = jest.fn();
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the modal with correct title and message when open", () => {
    render(
      <MockTheme>
        <TerminationWarningModal
          isOpen={true}
          onClose={mockOnClose}
          message="This is a termination warning message."
          onClick={mockOnClick}
        />
      </MockTheme>
    );

    expect(screen.getByText("terminateWarningModalTitle")).toBeInTheDocument();
    expect(
      screen.getByText("This is a termination warning message.")
    ).toBeInTheDocument();
    expect(screen.getByText("okayButtonText")).toBeInTheDocument();
  });

  test("calls onClick when the primary button is clicked", () => {
    render(
      <MockTheme>
        <TerminationWarningModal
          isOpen={true}
          onClose={mockOnClose}
          message="This is a termination warning message."
          onClick={mockOnClick}
        />
      </MockTheme>
    );

    const primaryButton = screen.getByText("okayButtonText");
    fireEvent.click(primaryButton);

    expect(mockOnClick).toHaveBeenCalled();
  });

  test("calls onClose when the modal is closed", () => {
    render(
      <MockTheme>
        <TerminationWarningModal
          isOpen={true}
          onClose={mockOnClose}
          message="This is a termination warning message."
          onClick={mockOnClick}
        />
      </MockTheme>
    );

    const closeButton = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test("does not render the modal when isOpen is false", () => {
    render(
      <MockTheme>
        <TerminationWarningModal
          isOpen={false}
          onClose={mockOnClose}
          message="This is a termination warning message."
          onClick={mockOnClick}
        />
      </MockTheme>
    );

    expect(
      screen.queryByText("terminateWarningModalTitle")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("This is a termination warning message.")
    ).not.toBeInTheDocument();
  });
});
