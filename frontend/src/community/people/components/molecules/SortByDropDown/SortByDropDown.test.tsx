import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";

import MockTheme from "~community/common/mocks/MockTheme";

import SortByDropDown from "./SortByDropDown";

jest.mock("~community/people/store/store", () => ({
  usePeopleStore: jest.fn(() => ({
    selectedYear: "2023",
    setSelectedYear: jest.fn(),
    holidayDataParams: { sortOrder: "ASC" }
  }))
}));

jest.mock("~community/common/utils/dateTimeUtils", () => ({
  currentYear: 2023,
  options: [
    { id: 1, name: "2023" },
    { id: 2, name: "2022" }
  ]
}));

describe("SortByDropDown", () => {
  const mockListInnerRef = { current: { scrollTop: 0 } };

  test("updates the selected year when a new year is selected", () => {
    const mockSetSelectedYear = jest.fn();
    jest
      .mocked(require("~community/people/store/store").usePeopleStore)
      .mockReturnValue({
        selectedYear: "2023",
        setSelectedYear: mockSetSelectedYear,
        holidayDataParams: { sortOrder: "ASC" }
      });

    render(
      <MockTheme>
        <SortByDropDown
          holidayData={[{ id: 1, name: "Holiday" }]}
          listInnerRef={mockListInnerRef}
        />
      </MockTheme>
    );

    const yearSelector = screen.getByText("2023");
    fireEvent.click(yearSelector);

    const newYearOption = screen.getByText("2022");
    fireEvent.click(newYearOption);

    expect(mockSetSelectedYear).toHaveBeenCalledWith("2022");
  });
});
