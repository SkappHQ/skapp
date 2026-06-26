import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";

import MockTheme from "~community/common/mocks/MockTheme";

import UserDeletionConfirmationModal from "./UserDeletionConfirmationModal";

// Mock hooks and functions
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn()
  }))
}));

jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (key: string[]) => key[key.length - 1]
}));

jest.mock("~community/common/providers/ToastProvider", () => ({
  useToast: jest.fn(() => ({
    setToastMessage: jest.fn()
  }))
}));

jest.mock("~community/people/api/PeopleApi", () => ({
  useDeleteUser: jest.fn((onSuccess, onError) => ({
    mutate: jest.fn(() => onSuccess())
  }))
}));

describe("UserDeletionConfirmationModal", () => {
  const mockOnClose = jest.fn();
  const mockRouterPush = jest.fn();
  const mockSetToastMessage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(require("next/navigation").useRouter).mockReturnValue({
      push: mockRouterPush
    });
    jest
      .mocked(require("~community/common/providers/ToastProvider").useToast)
      .mockReturnValue({
        setToastMessage: mockSetToastMessage
      });
  });

  test("renders the modal with correct title and description", () => {
    render(
      <MockTheme>
        <UserDeletionConfirmationModal isOpen={true} onClose={mockOnClose} />
      </MockTheme>
    );

    expect(
      screen.getByText("deleteConfirmationModalTitle")
    ).toBeInTheDocument();
    expect(
      screen.getByText("deleteConfirmationModalDescription")
    ).toBeInTheDocument();
  });

  test("calls onClose when cancel button is clicked", () => {
    render(
      <MockTheme>
        <UserDeletionConfirmationModal isOpen={true} onClose={mockOnClose} />
      </MockTheme>
    );

    const cancelButton = screen.getByText("cancelButtonLabel");
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test("does not render the modal when isOpen is false", () => {
    render(
      <MockTheme>
        <UserDeletionConfirmationModal isOpen={false} onClose={mockOnClose} />
      </MockTheme>
    );

    expect(
      screen.queryByText("deleteConfirmationModalTitle")
    ).not.toBeInTheDocument();
  });
});
