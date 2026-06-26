import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";

import MockTheme from "~community/common/mocks/MockTheme";

import BasicChipGroup from "./BasicChipGroup";

describe("BasicChipGroup", () => {
  const values = ["Chip 1", "Chip 2", "Chip 3", "Chip 4", "Chip 5"];
  const max = 3;

  test("renders the correct number of chips based on max prop", () => {
    render(
      <MockTheme>
        <BasicChipGroup values={values} max={max} />
      </MockTheme>
    );

    expect(screen.getByText("Chip 1")).toBeInTheDocument();
    expect(screen.getByText("Chip 2")).toBeInTheDocument();
    expect(screen.getByText("Chip 3")).toBeInTheDocument();
    expect(screen.queryByText("Chip 4")).not.toBeInTheDocument();
    expect(screen.getByText("+2")).toBeInTheDocument();
  });

  test("does not render hover modal when showHoverModal is false", () => {
    render(
      <MockTheme>
        <BasicChipGroup values={values} max={max} showHoverModal={false} />
      </MockTheme>
    );

    const moreChip = screen.getByText("+2");
    fireEvent.mouseEnter(moreChip);

    expect(screen.queryByText("Chip 4")).not.toBeInTheDocument();
    expect(screen.queryByText("Chip 5")).not.toBeInTheDocument();
  });
});
