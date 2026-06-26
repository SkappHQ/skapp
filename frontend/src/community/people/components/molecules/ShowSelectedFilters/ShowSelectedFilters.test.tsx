import { useTheme } from "@mui/material/styles";
import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";

import ShowSelectedFilters from "./ShowSelectedFilters";

// Mock hooks
jest.mock("@mui/material/styles", () => ({
  ...jest.requireActual("@mui/material/styles"),
  useTheme: jest.fn()
}));

jest.mock("@mui/material", () => ({
  ...jest.requireActual("@mui/material"),
  useMediaQuery: jest.fn()
}));

describe("ShowSelectedFilters", () => {
  const mockOnDeleteIcon = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useTheme).mockReturnValue({
      breakpoints: {
        down: jest.fn((size) => size)
      },
      palette: {
        grey: { 100: "#f5f5f5" },
        common: { black: "#000" }
      }
    });
  });

  test("renders no filters when filterOptions is empty", () => {
    render(<ShowSelectedFilters filterOptions={[]} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
