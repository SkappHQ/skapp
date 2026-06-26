import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";

import MockTheme from "~community/common/mocks/MockTheme";

import EmployeeTableFilterButton from "./EmployeeTableFilterButton";

// Mock hooks and functions
jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (key: string[]) => key[key.length - 1]
}));

jest.mock("~community/people/store/store", () => ({
  usePeopleStore: jest.fn(() => ({
    employeeDataFilter: { department: ["Engineering"], location: ["Remote"] },
    removeEmployeeFilter: jest.fn()
  }))
}));

describe("EmployeeTableFilterButton", () => {
  const mockHandleFilterClick = jest.fn();
  const mockRemoveEmployeeFilter = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .mocked(require("~community/people/store/store").usePeopleStore)
      .mockReturnValue({
        employeeDataFilter: {
          department: ["Engineering"],
          location: ["Remote"]
        },
        removeEmployeeFilter: mockRemoveEmployeeFilter
      });
  });

  test("renders the button with correct label when no filters are applied", () => {
    jest
      .mocked(require("~community/people/store/store").usePeopleStore)
      .mockReturnValue({
        employeeDataFilter: {},
        removeEmployeeFilter: mockRemoveEmployeeFilter
      });

    render(
      <MockTheme>
        <EmployeeTableFilterButton
          handleFilterClick={mockHandleFilterClick}
          filterId="filter-id"
          disabled={false}
        />
      </MockTheme>
    );

    expect(screen.getByText("filter")).toBeInTheDocument();
  });

  test("does not render the button when disabled", () => {
    render(
      <MockTheme>
        <EmployeeTableFilterButton
          handleFilterClick={mockHandleFilterClick}
          filterId="filter-id"
          disabled={true}
        />
      </MockTheme>
    );

    expect(screen.queryByText("filter")).not.toBeInTheDocument();
  });
});
