import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";

import MockTheme from "~community/common/mocks/MockTheme";
import { DiscardTypeEnums } from "~community/people/enums/DirectoryEnums";
import { EditAllInformationFormStatus } from "~community/people/types/EditEmployeeInfoTypes";

import DiscardChangeApprovalModal from "./DiscardChangeApprovalModal";

// Mock hooks and functions
jest.mock("next/router", () => ({
  useRouter: jest.fn(() => ({
    back: jest.fn()
  }))
}));

jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (key: string[]) => key[key.length - 1]
}));

describe("DiscardChangeApprovalModal", () => {
  const mockSetFormType = jest.fn();
  const mockSetIsDiscardChangesModal = jest.fn();
  const mockFunctionOnLeave = jest.fn();
  const mockRouterBack = jest.fn();
  const mockSetUpdateEmployeeStatus = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(require("next/router").useRouter).mockReturnValue({
      back: mockRouterBack
    });
  });

  const renderComponent = (props = {}) => {
    render(
      <MockTheme>
        <DiscardChangeApprovalModal
          setFormType={mockSetFormType}
          setIsDiscardChangesModal={mockSetIsDiscardChangesModal}
          isDiscardChangesModal={{
            isModalOpen: true,
            modalType: DiscardTypeEnums.LEAVE_TAB,
            modalOpenedFrom: "personal"
          }}
          functionOnLeave={mockFunctionOnLeave}
          updateEmployeeStatus={EditAllInformationFormStatus.PENDING}
          setUpdateEmployeeStatus={mockSetUpdateEmployeeStatus}
          {...props}
        />
      </MockTheme>
    );
  };

  test("renders the modal with correct title and buttons", () => {
    renderComponent();

    expect(screen.getByText("title")).toBeInTheDocument();
    expect(screen.getByText("leaveTabDescription")).toBeInTheDocument();
    expect(screen.getByText("saveChanges")).toBeInTheDocument();
    expect(screen.getByText("discard")).toBeInTheDocument();
  });

  test("calls handleSaveChanges when save button is clicked", () => {
    renderComponent();

    const saveButton = screen.getByText("saveChanges");
    fireEvent.click(saveButton);

    expect(mockSetUpdateEmployeeStatus).toHaveBeenCalledWith(
      EditAllInformationFormStatus.TRIGGERED
    );
  });

  test("navigates back when modalType is LEAVE_FORM and discard button is clicked", () => {
    renderComponent({
      isDiscardChangesModal: {
        isModalOpen: true,
        modalType: DiscardTypeEnums.LEAVE_FORM,
        modalOpenedFrom: ""
      }
    });

    const discardButton = screen.getByText("discard");
    fireEvent.click(discardButton);

    expect(mockRouterBack).toHaveBeenCalled();
  });
});
