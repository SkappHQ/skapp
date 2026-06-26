import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";

import {
  AvailableThemeColors,
  ThemeTypes
} from "~community/common/types/AvailableThemeColors";

import ColorInputField from "./ColorInputField";

describe("ColorInputField", () => {
  test("renders ColorInputField correctly", () => {
    render(<ColorInputField inputName="" value="" error="" />);
  });

  test("check whether label is rendered correctly", () => {
    render(
      <ColorInputField inputName="" label="Select Color" value="" error="" />
    );
    const label = screen.getByText("Select Color");
    expect(label).toBeInTheDocument();
  });

  test("check whether error message is rendered correctly", () => {
    render(
      <ColorInputField
        inputName="color"
        value="#FBBF24"
        error="This is a required field"
      />
    );
    const error = screen.getByText("This is a required field");
    expect(error).toBeInTheDocument();
  });

  test("check whether color is mapped correctly", () => {
    const handleSelect = jest.fn();
    render(
      <ColorInputField
        inputName="color"
        value="#93C5FD"
        onSelect={handleSelect}
        error="This is a required field"
      />
    );
    expect(handleSelect).toHaveBeenCalledWith("color", ThemeTypes.BLUE_THEME);
  });

  test("check whether color is mapped correctly", () => {
    const handleSelect = jest.fn();
    render(
      <ColorInputField
        inputName="color"
        value="#FBBF24"
        onSelect={handleSelect}
        error="This is a required field"
      />
    );
    expect(handleSelect).toHaveBeenCalledWith("color", ThemeTypes.YELLOW_THEME);
  });

  test("check whether color is mapped correctly", () => {
    const handleSelect = jest.fn();
    render(
      <ColorInputField
        inputName="color"
        value="#A3E635"
        onSelect={handleSelect}
        error="This is a required field"
      />
    );
    expect(handleSelect).toHaveBeenCalledWith("color", ThemeTypes.GREEN_THEME);
  });

  test("renders all available colors", () => {
    render(
      <ColorInputField
        inputName="color"
        value="#CBD5E1"
        error="This is a required field"
      />
    );
    AvailableThemeColors.map((color) => {
      const colors = screen.getByTestId(`colored-circle-${color}`);
      expect(colors).toBeInTheDocument();
    });
  });

  test("check whether correct color is selected when clicked", () => {
    const handleSelect = jest.fn();
    render(
      <ColorInputField
        inputName="color"
        value="#CBD5E1"
        onSelect={handleSelect}
        error="This is a required field"
      />
    );
    const newColor = AvailableThemeColors[2];
    const circle = screen.getByTestId(`colored-circle-${newColor}`);
    fireEvent.click(circle);
    expect(handleSelect).toHaveBeenCalledWith("color", newColor);
  });
});
