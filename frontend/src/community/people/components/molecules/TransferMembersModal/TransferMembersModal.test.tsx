import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";

import MockTheme from "~community/common/mocks/MockTheme";

import TransferMembersModal from "./TransferMembersModal";

jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (key: string[]) => key[key.length - 1]
}));

jest.mock("~community/people/store/store", () => ({
  usePeopleStore: jest.fn(() => ({
    currentTransferMembersData: null,
    allJobFamilies: [],
    setCurrentTransferMembersData: jest.fn()
  }))
}));

describe("TransferMembersModal", () => {
  const mockHandleSubmit = jest.fn();
  const mockHandleCancel = jest.fn();

  const mockInitialValues = [
    {
      employeeId: 1,
      jobFamily: { jobFamilyId: 1, name: "Engineering" },
      jobTitle: { jobTitleId: 1, name: "Software Engineer" }
    }
  ];

  const mockJobFamily = [
    { jobFamilyId: 1, name: "Engineering" },
    { jobFamilyId: 2, name: "Marketing" }
  ];

  const mockEmployees = [
    {
      employeeId: 1,
      firstName: "John",
      lastName: "Doe",
      authPic: "profile.jpg"
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the modal with correct description and buttons", () => {
    render(
      <MockTheme>
        <TransferMembersModal
          jobFamilyTransfer={true}
          description="Transfer members to a new job family"
          initialValues={mockInitialValues}
          jobFamily={mockJobFamily}
          employees={mockEmployees}
          handleSubmit={mockHandleSubmit}
          handleCancel={mockHandleCancel}
          primaryBtnText="Transfer"
        />
      </MockTheme>
    );

    expect(
      screen.getByText("Transfer members to a new job family")
    ).toBeInTheDocument();
    expect(screen.getByText("Transfer")).toBeInTheDocument();
    expect(screen.getByText("backBtnText")).toBeInTheDocument();
  });

  test("calls handleCancel when back button is clicked", () => {
    render(
      <MockTheme>
        <TransferMembersModal
          jobFamilyTransfer={true}
          description="Transfer members to a new job family"
          initialValues={mockInitialValues}
          jobFamily={mockJobFamily}
          employees={mockEmployees}
          handleSubmit={mockHandleSubmit}
          handleCancel={mockHandleCancel}
          primaryBtnText="Transfer"
        />
      </MockTheme>
    );

    const backButton = screen.getByText("backBtnText");
    fireEvent.click(backButton);

    expect(mockHandleCancel).toHaveBeenCalled();
  });
});
