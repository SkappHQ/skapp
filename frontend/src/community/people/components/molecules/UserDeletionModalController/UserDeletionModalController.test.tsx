import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import MockTheme from "~community/common/mocks/MockTheme";

import UserDeletionModalController from "./UserDeletionModalController";

// Mock hooks and components
jest.mock("~community/people/store/store", () => ({
  usePeopleStore: jest.fn(() => ({
    isDeletionConfirmationModalOpen: false,
    isDeletionAlertOpen: false,
    setDeletionConfirmationModalOpen: jest.fn(),
    setDeletionAlertOpen: jest.fn(),
    deletionAlertMessage: "Test alert message"
  }))
}));

jest.mock(
  "../UserDeletionConfirmationModal/UserDeletionConfirmationModal",
  () => ({
    __esModule: true,
    default: ({ isOpen, onClose }: any) =>
      isOpen && (
        <div data-testid="confirmation-modal">
          <button onClick={onClose}>Close Confirmation Modal</button>
        </div>
      )
  })
);

jest.mock("../UserDeletionWarningModal/UserDeletionWarningModal", () => ({
  __esModule: true,
  default: ({ isOpen, onClose, message, onClick }: any) =>
    isOpen && (
      <div data-testid="warning-modal">
        <p>{message}</p>
        <button onClick={onClick}>Acknowledge Warning</button>
        <button onClick={onClose}>Close Warning Modal</button>
      </div>
    )
}));

describe("UserDeletionModalController", () => {
  const mockSetDeletionConfirmationModalOpen = jest.fn();
  const mockSetDeletionAlertOpen = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .mocked(require("~community/people/store/store").usePeopleStore)
      .mockReturnValue({
        isDeletionConfirmationModalOpen: false,
        isDeletionAlertOpen: false,
        setDeletionConfirmationModalOpen: mockSetDeletionConfirmationModalOpen,
        setDeletionAlertOpen: mockSetDeletionAlertOpen,
        deletionAlertMessage: "Test alert message"
      });
  });

  test("renders without modals when both modals are closed", () => {
    render(
      <MockTheme>
        <UserDeletionModalController />
      </MockTheme>
    );

    expect(screen.queryByTestId("confirmation-modal")).not.toBeInTheDocument();
    expect(screen.queryByTestId("warning-modal")).not.toBeInTheDocument();
  });

  test("renders the confirmation modal when isDeletionConfirmationModalOpen is true", () => {
    jest
      .mocked(require("~community/people/store/store").usePeopleStore)
      .mockReturnValue({
        isDeletionConfirmationModalOpen: true,
        isDeletionAlertOpen: false,
        setDeletionConfirmationModalOpen: mockSetDeletionConfirmationModalOpen,
        setDeletionAlertOpen: mockSetDeletionAlertOpen,
        deletionAlertMessage: "Test alert message"
      });

    render(
      <MockTheme>
        <UserDeletionModalController />
      </MockTheme>
    );

    expect(screen.getByTestId("confirmation-modal")).toBeInTheDocument();
  });

  test("renders the warning modal when isDeletionAlertOpen is true", () => {
    jest
      .mocked(require("~community/people/store/store").usePeopleStore)
      .mockReturnValue({
        isDeletionConfirmationModalOpen: false,
        isDeletionAlertOpen: true,
        setDeletionConfirmationModalOpen: mockSetDeletionConfirmationModalOpen,
        setDeletionAlertOpen: mockSetDeletionAlertOpen,
        deletionAlertMessage: "Test alert message"
      });

    render(
      <MockTheme>
        <UserDeletionModalController />
      </MockTheme>
    );

    expect(screen.getByTestId("warning-modal")).toBeInTheDocument();
    expect(screen.getByText("Test alert message")).toBeInTheDocument();
  });

  test("closes the confirmation modal when close button is clicked", async () => {
    jest
      .mocked(require("~community/people/store/store").usePeopleStore)
      .mockReturnValue({
        isDeletionConfirmationModalOpen: true,
        isDeletionAlertOpen: false,
        setDeletionConfirmationModalOpen: mockSetDeletionConfirmationModalOpen,
        setDeletionAlertOpen: mockSetDeletionAlertOpen,
        deletionAlertMessage: "Test alert message"
      });

    const user = userEvent.setup();
    render(
      <MockTheme>
        <UserDeletionModalController />
      </MockTheme>
    );

    const closeButton = screen.getByText("Close Confirmation Modal");
    await user.click(closeButton);

    expect(mockSetDeletionConfirmationModalOpen).toHaveBeenCalledWith(false);
  });

  test("closes the warning modal when close button is clicked", async () => {
    jest
      .mocked(require("~community/people/store/store").usePeopleStore)
      .mockReturnValue({
        isDeletionConfirmationModalOpen: false,
        isDeletionAlertOpen: true,
        setDeletionConfirmationModalOpen: mockSetDeletionConfirmationModalOpen,
        setDeletionAlertOpen: mockSetDeletionAlertOpen,
        deletionAlertMessage: "Test alert message"
      });

    const user = userEvent.setup();
    render(
      <MockTheme>
        <UserDeletionModalController />
      </MockTheme>
    );

    const closeButton = screen.getByText("Close Warning Modal");
    await user.click(closeButton);

    expect(mockSetDeletionAlertOpen).toHaveBeenCalledWith(false);
  });

  test("acknowledges the warning modal when acknowledge button is clicked", async () => {
    jest
      .mocked(require("~community/people/store/store").usePeopleStore)
      .mockReturnValue({
        isDeletionConfirmationModalOpen: false,
        isDeletionAlertOpen: true,
        setDeletionConfirmationModalOpen: mockSetDeletionConfirmationModalOpen,
        setDeletionAlertOpen: mockSetDeletionAlertOpen,
        deletionAlertMessage: "Test alert message"
      });

    const user = userEvent.setup();
    render(
      <MockTheme>
        <UserDeletionModalController />
      </MockTheme>
    );

    const acknowledgeButton = screen.getByText("Acknowledge Warning");
    await user.click(acknowledgeButton);

    expect(mockSetDeletionAlertOpen).toHaveBeenCalledWith(false);
  });
});
