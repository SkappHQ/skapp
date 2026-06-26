import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";

import MockTheme from "~community/common/mocks/MockTheme";

import EmployeeDataSortMenuItems from "./EmployeeDataSortMenuItems";

// Mock hooks and functions
jest.mock("~community/people/store/store", () => ({
  usePeopleStore: jest.fn((selector) => {
    const state = {
      employeeDataParams: {
        sortKey: "NAME",
        sortOrder: "ASC"
      },
      handleEmployeeDataSort: jest.fn()
    };
    return selector(state);
  })
}));

jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (key: string[]) => key[key.length - 1]
}));

describe("EmployeeDataSortMenuItems", () => {
  const mockHandleClose = jest.fn();
  const mockScrollToTop = jest.fn();
  const mockHandleEmployeeDataSort = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .mocked(require("~community/people/store/store").usePeopleStore)
      .mockImplementation((selector) => {
        const state = {
          employeeDataParams: {
            sortKey: "NAME",
            sortOrder: "ASC"
          },
          handleEmployeeDataSort: mockHandleEmployeeDataSort
        };
        return selector(state);
      });
  });

  test("renders sort options correctly", () => {
    render(
      <MockTheme>
        <EmployeeDataSortMenuItems
          handleClose={mockHandleClose}
          scrollToTop={mockScrollToTop}
        />
      </MockTheme>
    );

    expect(screen.getByText("sortAlphabeticalAsc")).toBeInTheDocument();
    expect(screen.getByText("sortAlphabeticalDesc")).toBeInTheDocument();
  });

  test("calls handleEmployeeDataSort and handleClose when ascending sort is clicked", () => {
    render(
      <MockTheme>
        <EmployeeDataSortMenuItems
          handleClose={mockHandleClose}
          scrollToTop={mockScrollToTop}
        />
      </MockTheme>
    );

    const ascOption = screen.getByText("sortAlphabeticalAsc");
    fireEvent.click(ascOption);

    expect(mockHandleEmployeeDataSort).toHaveBeenCalledWith("sortKey", "NAME");
    expect(mockHandleEmployeeDataSort).toHaveBeenCalledWith("sortOrder", "ASC");
    expect(mockHandleClose).toHaveBeenCalled();
    expect(mockScrollToTop).toHaveBeenCalled();
  });

  test("calls handleEmployeeDataSort and handleClose when descending sort is clicked", () => {
    render(
      <MockTheme>
        <EmployeeDataSortMenuItems
          handleClose={mockHandleClose}
          scrollToTop={mockScrollToTop}
        />
      </MockTheme>
    );

    const descOption = screen.getByText("sortAlphabeticalDesc");
    fireEvent.click(descOption);

    expect(mockHandleEmployeeDataSort).toHaveBeenCalledWith("sortKey", "NAME");
    expect(mockHandleEmployeeDataSort).toHaveBeenCalledWith(
      "sortOrder",
      "DESC"
    );
    expect(mockHandleClose).toHaveBeenCalled();
    expect(mockScrollToTop).toHaveBeenCalled();
  });

  test("does not call scrollToTop if it is not provided", () => {
    render(
      <MockTheme>
        <EmployeeDataSortMenuItems handleClose={mockHandleClose} />
      </MockTheme>
    );

    const ascOption = screen.getByText("sortAlphabeticalAsc");
    fireEvent.click(ascOption);

    expect(mockScrollToTop).not.toHaveBeenCalled();
  });
});
