import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";

import MockTheme from "~community/common/mocks/MockTheme";
import { leaveTypeColors } from "~community/leave/constants/configs";

import ColorPalette from "./ColorPalette";

describe("ColorPalette", () => {
  const label = "Choose a color";

  test("renders label and required indicator when required is true", () => {
    render(
      <MockTheme>
        <ColorPalette
          label={label}
          colors={leaveTypeColors}
          onClick={jest.fn()}
          selectedColor={""}
          required={true}
        />
      </MockTheme>
    );

    const labelElement = screen.getByText("Choose a color");
    expect(labelElement).toBeInTheDocument();
  });

  test("renders the selected color at the beginning", () => {
    render(
      <MockTheme>
        <ColorPalette
          label={label}
          colors={leaveTypeColors}
          onClick={jest.fn()}
          selectedColor={"#00FF00"}
        />
      </MockTheme>
    );

    const selectedColorBox = screen.getAllByTestId(/input-color-/i)[0];
    expect(selectedColorBox).toHaveStyle("background-color: #00FF00");
  });

  test("handles color selection click", () => {
    const handleClick = jest.fn();

    render(
      <MockTheme>
        <ColorPalette
          label={label}
          colors={leaveTypeColors}
          onClick={handleClick}
          selectedColor={""}
        />
      </MockTheme>
    );

    const firstColor = screen.getAllByTestId(/input-color-/i)[0];
    fireEvent.click(firstColor);

    expect(handleClick).toHaveBeenCalledWith(leaveTypeColors[0]);
  });

  test("renders more colors button and opens overlay", () => {
    render(
      <MockTheme>
        <ColorPalette
          label={label}
          colors={leaveTypeColors}
          onClick={jest.fn()}
          selectedColor=""
        />
      </MockTheme>
    );

    const dropDownIconBtn = screen.getByTestId("drop-down-icon-btn");
    expect(dropDownIconBtn).toBeInTheDocument();

    fireEvent.click(dropDownIconBtn);

    const colorPaletteField = screen.getByTestId("color-palette");
    expect(colorPaletteField).toHaveStyle("height: max-content");
  });
});
