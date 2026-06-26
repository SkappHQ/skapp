import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";

import { useGetUploadedImage } from "~community/common/api/FileHandleApi";
import MockTheme from "~community/common/mocks/MockTheme";
import { usePeopleStore } from "~community/people/store/store";

import UserDetailsCentered from "./UserDetailsCentered";

// Mock hooks and functions
jest.mock("~community/people/store/store", () => ({
  usePeopleStore: jest.fn(() => ({
    employee: { common: { authPic: "" } },
    thumbnail: "",
    setCommonDetails: jest.fn(),
    setThumbnail: jest.fn(),
    setProfilePic: jest.fn()
  }))
}));

jest.mock("~community/common/api/FileHandleApi", () => ({
  useGetUploadedImage: jest.fn(() => ({
    data: "mockUploadedImage",
    isLoading: false
  }))
}));

jest.mock("~community/people/utils/image/thumbnailGenerator", () =>
  jest.fn(() => Promise.resolve("mockThumbnail"))
);

describe("UserDetailsCentered", () => {
  const mockSetCommonDetails = jest.fn();
  const mockSetThumbnail = jest.fn();
  const mockSetProfilePic = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(usePeopleStore).mockReturnValue({
      employee: { common: { authPic: "" } },
      thumbnail: "",
      setCommonDetails: mockSetCommonDetails,
      setThumbnail: mockSetThumbnail,
      setProfilePic: mockSetProfilePic
    });
    jest.mocked(useGetUploadedImage).mockReturnValue({
      data: "mockUploadedImage",
      isLoading: false
    });
  });

  test("renders the component with user details", () => {
    render(
      <MockTheme>
        <UserDetailsCentered
          selectedUser={{
            personal: { general: { firstName: "John", lastName: "Doe" } },
            common: { jobTitle: "Software Engineer", authPic: "" },
            employment: { employmentDetails: { employeeNumber: "12345" } }
          }}
        />
      </MockTheme>
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
  });
});
