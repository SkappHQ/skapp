import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";

import MockTheme from "~community/common/mocks/MockTheme";

import TerminateConfirmationModal from "./TerminateConfirmationModal";

// Mock hooks and functions
jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (key: string[]) => key[key.length - 1]
}));

jest.mock("~community/common/providers/ToastProvider", () => ({
  useToast: jest.fn(() => ({
    toastMessage: { open: false },
    setToastMessage: jest.fn()
  }))
}));

jest.mock("~community/people/api/PeopleApi", () => ({
  useTerminateUser: jest.fn((onSuccess, onError) => ({
    mutate: jest.fn(() => onSuccess())
  }))
}));

describe("TerminateConfirmationModal", () => {
  const mockOnClose = jest.fn();
  const mockSetToastMessage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .mocked(require("~community/common/providers/ToastProvider").useToast)
      .mockReturnValue({
        toastMessage: { open: false },
        setToastMessage: mockSetToastMessage
      });
  });

  test("renders the modal with correct title and description when open", () => {
    render(
      <MockTheme>
        <TerminateConfirmationModal isOpen={true} onClose={mockOnClose} />
      </MockTheme>
    );

    expect(
      screen.getByText("terminateConfirmationModalTitle")
    ).toBeInTheDocument();
    expect(
      screen.getByText("terminateConfirmationModalDescription")
    ).toBeInTheDocument();
    expect(screen.getByText("terminateButtonText")).toBeInTheDocument();
    expect(screen.getByText("cancelButtonText")).toBeInTheDocument();
  });

  test("calls onClose when cancel button is clicked", () => {
    render(
      <MockTheme>
        <TerminateConfirmationModal isOpen={true} onClose={mockOnClose} />
      </MockTheme>
    );

    const cancelButton = screen.getByText("cancelButtonText");
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test("does not render the modal when isOpen is false", () => {
    render(
      <MockTheme>
        <TerminateConfirmationModal isOpen={false} onClose={mockOnClose} />
      </MockTheme>
    );

    expect(
      screen.queryByText("terminateConfirmationModalTitle")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("terminateConfirmationModalDescription")
    ).not.toBeInTheDocument();
  });
});
