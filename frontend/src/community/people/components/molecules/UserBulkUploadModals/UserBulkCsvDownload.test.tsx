import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";

import MockTheme from "~community/common/mocks/MockTheme";

import UserBulkCsvDownload from "./UserBulkCsvDownload";

// Mock hooks and functions
jest.mock("~community/people/store/store", () => ({
  usePeopleStore: jest.fn(() => ({
    setIsDirectoryModalOpen: jest.fn(),
    setDirectoryModalType: jest.fn()
  }))
}));

jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (key: string[]) => key[key.length - 1]
}));

jest.mock("~enterprise/common/store/commonStore", () => ({
  useCommonEnterpriseStore: jest.fn(() => ({
    ongoingQuickSetup: { INVITE_EMPLOYEES: true }
  }))
}));

describe("UserBulkCsvDownload", () => {
  const mockSetIsDirectoryModalOpen = jest.fn();
  const mockSetDirectoryModalType = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .mocked(require("~community/people/store/store").usePeopleStore)
      .mockReturnValue({
        setIsDirectoryModalOpen: mockSetIsDirectoryModalOpen,
        setDirectoryModalType: mockSetDirectoryModalType
      });
  });

  test("renders the component with correct text and buttons", () => {
    render(
      <MockTheme>
        <UserBulkCsvDownload />
      </MockTheme>
    );

    expect(screen.getByText("downloadCsvDes")).toBeInTheDocument();
    expect(screen.getByText("downloadCsvButton")).toBeInTheDocument();
    expect(screen.getByText("nextButton")).toBeInTheDocument();
  });

  test("handles next button click and opens the modal", () => {
    render(
      <MockTheme>
        <UserBulkCsvDownload />
      </MockTheme>
    );

    const nextButton = screen.getByText("nextButton");
    fireEvent.click(nextButton);

    expect(mockSetIsDirectoryModalOpen).toHaveBeenCalledWith(true);
    expect(mockSetDirectoryModalType).toHaveBeenCalledWith("UPLOAD_CSV");
  });
});
