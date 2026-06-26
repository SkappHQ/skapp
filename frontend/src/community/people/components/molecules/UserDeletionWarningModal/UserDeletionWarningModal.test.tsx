import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";

import MockTheme from "~community/common/mocks/MockTheme";

import UserDeletionWarningModal from "./UserDeletionWarningModal";

jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (key: string[]) => key[key.length - 1]
}));

describe("UserDeletionWarningModal", () => {
  const mockOnClose = jest.fn();
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the modal with correct title and message", () => {
    render(
      <MockTheme>
        <UserDeletionWarningModal
          isOpen={true}
          onClose={mockOnClose}
          message="Are you sure you want to delete this user?"
          onClick={mockOnClick}
        />
      </MockTheme>
    );

    expect(screen.getByText("deleteWarningTitle")).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure you want to delete this user?")
    ).toBeInTheDocument();
    expect(screen.getByText("okayButtonLabel")).toBeInTheDocument();
  });

  test("calls onClose when the modal is closed", () => {
    render(
      <MockTheme>
        <UserDeletionWarningModal
          isOpen={true}
          onClose={mockOnClose}
          message="Are you sure you want to delete this user?"
          onClick={mockOnClick}
        />
      </MockTheme>
    );

    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test("calls onClick when the primary button is clicked", () => {
    render(
      <MockTheme>
        <UserDeletionWarningModal
          isOpen={true}
          onClose={mockOnClose}
          message="Are you sure you want to delete this user?"
          onClick={mockOnClick}
        />
      </MockTheme>
    );

    fireEvent.click(screen.getByText("okayButtonLabel"));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  test("does not render the modal when isOpen is false", () => {
    render(
      <MockTheme>
        <UserDeletionWarningModal
          isOpen={false}
          onClose={mockOnClose}
          message="Are you sure you want to delete this user?"
          onClick={mockOnClick}
        />
      </MockTheme>
    );

    expect(screen.queryByText("deleteWarningTitle")).not.toBeInTheDocument();
  });
});
