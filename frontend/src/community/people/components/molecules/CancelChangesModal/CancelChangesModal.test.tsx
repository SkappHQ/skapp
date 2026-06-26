import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";

import MockTheme from "~community/common/mocks/MockTheme";

import CancelChangesModal from "./CancelChangesModal";

// Mock hooks and functions
jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (key: string[]) => key[key.length - 1]
}));

describe("CancelChangesModal", () => {
  const mockOnCancel = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the modal with correct title and description when open", () => {
    render(
      <MockTheme>
        <CancelChangesModal
          isOpen={true}
          onCancel={mockOnCancel}
          onConfirm={mockOnConfirm}
        />
      </MockTheme>
    );

    expect(screen.getByText("unsavedModalTitle")).toBeInTheDocument();
    expect(
      screen.getByText("cancelChangesModalDescription")
    ).toBeInTheDocument();
    expect(
      screen.getByText("cancelChangesModalConfirmButton")
    ).toBeInTheDocument();
    expect(
      screen.getByText("cancelChangesModalCancelButton")
    ).toBeInTheDocument();
  });

  test("calls onConfirm when the confirm button is clicked", () => {
    render(
      <MockTheme>
        <CancelChangesModal
          isOpen={true}
          onCancel={mockOnCancel}
          onConfirm={mockOnConfirm}
        />
      </MockTheme>
    );

    const confirmButton = screen.getByText("cancelChangesModalConfirmButton");
    fireEvent.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalled();
  });

  test("calls onCancel when the cancel button is clicked", () => {
    render(
      <MockTheme>
        <CancelChangesModal
          isOpen={true}
          onCancel={mockOnCancel}
          onConfirm={mockOnConfirm}
        />
      </MockTheme>
    );

    const cancelButton = screen.getByText("cancelChangesModalCancelButton");
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  test("does not render the modal when isOpen is false", () => {
    render(
      <MockTheme>
        <CancelChangesModal
          isOpen={false}
          onCancel={mockOnCancel}
          onConfirm={mockOnConfirm}
        />
      </MockTheme>
    );

    expect(screen.queryByText("unsavedModalTitle")).not.toBeInTheDocument();
    expect(
      screen.queryByText("cancelChangesModalDescription")
    ).not.toBeInTheDocument();
  });
});
