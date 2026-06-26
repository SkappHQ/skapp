import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";

import MockTheme from "~community/common/mocks/MockTheme";

import EmployeeFilterSection from "./EmployeeFilterSection";

describe("EmployeeFilterSection", () => {
  const mockHandleFilterChange = jest.fn();
  const mockData = [
    { label: "Filter 1", value: "filter1" },
    { label: "Filter 2", value: "filter2" }
  ];
  const mockCurrentFilter = ["filter1"];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the section with the correct title and chips", () => {
    render(
      <MockTheme>
        <EmployeeFilterSection
          title="Test Title"
          data={mockData}
          filterKey="testKey"
          currentFilter={mockCurrentFilter}
          handleFilterChange={mockHandleFilterChange}
        />
      </MockTheme>
    );

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Filter 1")).toBeInTheDocument();
    expect(screen.getByText("Filter 2")).toBeInTheDocument();
  });

  test("applies selected styles to chips in the current filter", () => {
    render(
      <MockTheme>
        <EmployeeFilterSection
          title="Test Title"
          data={mockData}
          filterKey="testKey"
          currentFilter={mockCurrentFilter}
          handleFilterChange={mockHandleFilterChange}
        />
      </MockTheme>
    );

    const selectedChip = screen.getByText("Filter 1");
    expect(selectedChip).toHaveStyle("background-color: #"); // Replace with actual selected color
  });

  test("calls handleFilterChange with correct arguments when a chip is clicked", () => {
    render(
      <MockTheme>
        <EmployeeFilterSection
          title="Test Title"
          data={mockData}
          filterKey="testKey"
          currentFilter={mockCurrentFilter}
          handleFilterChange={mockHandleFilterChange}
        />
      </MockTheme>
    );

    const chip = screen.getByText("Filter 2");
    fireEvent.click(chip);

    expect(mockHandleFilterChange).toHaveBeenCalledWith(
      "filter2",
      "testKey",
      mockCurrentFilter
    );
  });
});
