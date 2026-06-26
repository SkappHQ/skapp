import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";

import MockTheme from "~community/common/mocks/MockTheme";

import ClockInTableFIlterBy from "./ClockInTableFIlterBy";

jest.mock(
  "~community/common/components/molecules/TableFilterButton/TableFilterButton",
  () => ({
    __esModule: true,
    default: ({ handleFilterClick, filterId, disabled }: any) => (
      <button
        data-testid="table-filter-button"
        onClick={handleFilterClick}
        disabled={disabled}
      >
        Filter Button {filterId}
      </button>
    )
  })
);

describe("ClockInTableFIlterBy", () => {
  const mockHandleFilterClick = jest.fn();
  const mockHandleFilterClose = jest.fn();
  const mockScrollToTop = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the component with the filter button", () => {
    render(
      <MockTheme>
        <ClockInTableFIlterBy
          filterEl={null}
          handleFilterClose={mockHandleFilterClose}
          handleFilterClick={mockHandleFilterClick}
          disabled={false}
          filterId="test-filter"
          filterOpen={false}
          scrollToTop={mockScrollToTop}
        />
      </MockTheme>
    );

    const filterButton = screen.getByTestId("table-filter-button");
    expect(filterButton).toBeInTheDocument();
    expect(filterButton).toHaveTextContent("Filter Button test-filter");
    expect(filterButton).not.toBeDisabled();
  });

  test("disables the filter button when disabled prop is true", () => {
    render(
      <MockTheme>
        <ClockInTableFIlterBy
          filterEl={null}
          handleFilterClose={mockHandleFilterClose}
          handleFilterClick={mockHandleFilterClick}
          disabled={true}
          filterId="test-filter"
          filterOpen={false}
          scrollToTop={mockScrollToTop}
        />
      </MockTheme>
    );

    const filterButton = screen.getByTestId("table-filter-button");
    expect(filterButton).toBeDisabled();
  });

  test("calls handleFilterClick when the filter button is clicked", () => {
    render(
      <MockTheme>
        <ClockInTableFIlterBy
          filterEl={null}
          handleFilterClose={mockHandleFilterClose}
          handleFilterClick={mockHandleFilterClick}
          disabled={false}
          filterId="test-filter"
          filterOpen={false}
          scrollToTop={mockScrollToTop}
        />
      </MockTheme>
    );

    const filterButton = screen.getByTestId("table-filter-button");
    fireEvent.click(filterButton);

    expect(mockHandleFilterClick).toHaveBeenCalledTimes(1);
  });
});
