import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

import MockTheme from "~community/common/mocks/MockTheme";

import AdvancedFilterButton from "./AdvancedFilterButton";

// Import MockTheme

// Mock useTranslator
jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (key: string[]) => key[key.length - 1]
}));

describe("AdvancedFilterButton", () => {
  const filterTypes = {
    Category: [
      { label: "Option 1", value: "option1" },
      { label: "Option 2", value: "option2" }
    ],
    Status: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" }
    ]
  };

  const selectedFilters = {
    Category: ["option1"],
    Status: []
  };

  const mockOnApplyFilters = jest.fn();
  const mockOnResetFilters = jest.fn();
  const mockSetSelectedFilters = jest.fn();

  test("resets filters when the reset button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <MockTheme>
        <AdvancedFilterButton
          filterTypes={filterTypes}
          selectedFilters={selectedFilters}
          setSelectedFilters={mockSetSelectedFilters}
          onApplyFilters={mockOnApplyFilters}
          onResetFilters={mockOnResetFilters}
        />
      </MockTheme>
    );

    const filterButton = screen.getByText("placeholder");
    await user.click(filterButton);

    const resetButton = screen.getByText("resetBtn");
    await user.click(resetButton);

    expect(mockOnResetFilters).toHaveBeenCalled();
  });
});
