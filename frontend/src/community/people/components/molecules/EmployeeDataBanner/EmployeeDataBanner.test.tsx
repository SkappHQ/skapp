import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";

import MockTheme from "~community/common/mocks/MockTheme";

import EmployeeDataBanner from "./EmployeeDataBanner";

describe("EmployeeDataBanner", () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the banner with correct title for multiple employees", () => {
    render(
      <MockTheme>
        <EmployeeDataBanner
          count={5}
          title="employees"
          titleForOne="employee"
          prompt="View Details"
          onClick={mockOnClick}
        />
      </MockTheme>
    );

    expect(screen.getByText("5 employees")).toBeInTheDocument();
    expect(screen.getByText("View Details")).toBeInTheDocument();
  });

  test("renders the banner with correct title for a single employee", () => {
    render(
      <MockTheme>
        <EmployeeDataBanner
          count={1}
          title="employees"
          titleForOne="employee"
          prompt="View Details"
          onClick={mockOnClick}
        />
      </MockTheme>
    );

    expect(screen.getByText("employee")).toBeInTheDocument();
    expect(screen.getByText("View Details")).toBeInTheDocument();
  });

  test("calls onClick when the prompt is clicked", () => {
    render(
      <MockTheme>
        <EmployeeDataBanner
          count={3}
          title="employees"
          titleForOne="employee"
          prompt="View Details"
          onClick={mockOnClick}
        />
      </MockTheme>
    );

    const prompt = screen.getByText("View Details");
    fireEvent.click(prompt);

    expect(mockOnClick).toHaveBeenCalled();
  });
});
