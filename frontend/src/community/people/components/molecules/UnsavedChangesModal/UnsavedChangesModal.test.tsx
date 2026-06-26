import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";

import MockTheme from "~community/common/mocks/MockTheme";

import UnsavedChangesModal from "./UnsavedChangesModal";

// Mock hooks and functions
jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (key: string[]) => key[key.length - 1]
}));

describe("UnsavedChangesModal", () => {
  const mockOnDiscard = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the modal with correct title and description when open", () => {
    render(
      <MockTheme>
        <UnsavedChangesModal
          isOpen={true}
          onDiscard={mockOnDiscard}
          onSave={mockOnSave}
        />
      </MockTheme>
    );

    expect(screen.getByText("unsavedModalTitle")).toBeInTheDocument();
    expect(screen.getByText("unsavedModalDescription")).toBeInTheDocument();
    expect(screen.getByText("unsavedModalSaveButton")).toBeInTheDocument();
    expect(screen.getByText("unsavedModalDiscardButton")).toBeInTheDocument();
  });

  test("calls onSave when the save button is clicked", () => {
    render(
      <MockTheme>
        <UnsavedChangesModal
          isOpen={true}
          onDiscard={mockOnDiscard}
          onSave={mockOnSave}
        />
      </MockTheme>
    );

    const saveButton = screen.getByText("unsavedModalSaveButton");
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalled();
  });

  test("calls onDiscard when the discard button is clicked", () => {
    render(
      <MockTheme>
        <UnsavedChangesModal
          isOpen={true}
          onDiscard={mockOnDiscard}
          onSave={mockOnSave}
        />
      </MockTheme>
    );

    const discardButton = screen.getByText("unsavedModalDiscardButton");
    fireEvent.click(discardButton);

    expect(mockOnDiscard).toHaveBeenCalled();
  });

  test("does not render the modal when isOpen is false", () => {
    render(
      <MockTheme>
        <UnsavedChangesModal
          isOpen={false}
          onDiscard={mockOnDiscard}
          onSave={mockOnSave}
        />
      </MockTheme>
    );

    expect(screen.queryByText("unsavedModalTitle")).not.toBeInTheDocument();
    expect(
      screen.queryByText("unsavedModalDescription")
    ).not.toBeInTheDocument();
  });
});
