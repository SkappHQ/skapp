import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";

import MockTheme from "~community/common/mocks/MockTheme";

import ColorPaletteSkeleton from "./ColorPaletteSkeleton";

describe("ColorPaletteSkeleton", () => {
  test("renders the label correctly", () => {
    render(
      <MockTheme>
        <ColorPaletteSkeleton label="Color Palette" />
      </MockTheme>
    );
    const label = screen.getByText("Color Palette");
    expect(label).toBeInTheDocument();
  });

  test("renders the correct number of skeletons by default", () => {
    render(
      <MockTheme>
        <ColorPaletteSkeleton label="Color Palette" />
      </MockTheme>
    );
    const skeletons = screen.getAllByTestId(/skeleton-/i);
    expect(skeletons).toHaveLength(7);
  });

  test("renders the correct number of skeletons when numberOfColors is provided", () => {
    render(
      <MockTheme>
        <ColorPaletteSkeleton label="Color Palette" numberOfColors={5} />
      </MockTheme>
    );
    const skeletons = screen.getAllByTestId(/skeleton-/i);
    expect(skeletons).toHaveLength(5);
  });

  test("applies correct styles to the skeletons", () => {
    render(
      <MockTheme>
        <ColorPaletteSkeleton label="Color Palette" numberOfColors={3} />
      </MockTheme>
    );
    const skeletons = screen.getAllByTestId(/skeleton-/i);
    skeletons.forEach((skeleton) => {
      expect(skeleton).toHaveStyle("width: 1.75rem");
      expect(skeleton).toHaveStyle("height: 1.75rem");
    });
  });
});
