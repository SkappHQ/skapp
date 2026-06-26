import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";

import MockTheme from "~community/common/mocks/MockTheme";
import { MenuTypes } from "~community/common/types/MoleculeTypes";

import EmployeeDataMenu from "./EmployeeDataMenu";

// Mock hooks and components
jest.mock("~community/common/hooks/useMediaQuery", () => ({
  useMediaQuery: jest.fn(() => () => false)
}));

jest.mock("../EmployeeDataFIlterMenuItems/EmployeeDataFIlterMenuItems", () => ({
  __esModule: true,
  default: jest.fn(() => <div>Filter Menu Items</div>)
}));

jest.mock("../EmployeeDataSortMenuItems/EmployeeDataSortMenuItems", () => ({
  __esModule: true,
  default: jest.fn(() => <div>Sort Menu Items</div>)
}));

describe("EmployeeDataMenu", () => {
  const mockHandleClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the filter menu when menuType is FILTER", () => {
    render(
      <MockTheme>
        <EmployeeDataMenu
          anchorEl={null}
          handleClose={mockHandleClose}
          position="bottom"
          menuType={MenuTypes.FILTER}
          id="filter-menu"
          open={true}
          scrollToTop={jest.fn()}
          teams={[]}
          jobFamilies={[]}
        />
      </MockTheme>
    );

    expect(screen.getByText("Filter Menu Items")).toBeInTheDocument();
  });

  test("renders the sort menu when menuType is SORT", () => {
    render(
      <MockTheme>
        <EmployeeDataMenu
          anchorEl={null}
          handleClose={mockHandleClose}
          position="bottom"
          menuType={MenuTypes.SORT}
          id="sort-menu"
          open={true}
          scrollToTop={jest.fn()}
        />
      </MockTheme>
    );

    expect(screen.getByText("Sort Menu Items")).toBeInTheDocument();
  });

  test("does not render the menu when open is false", () => {
    render(
      <MockTheme>
        <EmployeeDataMenu
          anchorEl={null}
          handleClose={mockHandleClose}
          position="bottom"
          menuType={MenuTypes.FILTER}
          id="filter-menu"
          open={false}
          scrollToTop={jest.fn()}
        />
      </MockTheme>
    );

    expect(screen.queryByText("Filter Menu Items")).not.toBeInTheDocument();
    expect(screen.queryByText("Sort Menu Items")).not.toBeInTheDocument();
  });
});
