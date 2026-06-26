import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import MockTheme from "~community/common/mocks/MockTheme";

import BasicChip from "./BasicChip";

describe("Basic Chip", () => {
  beforeAll(() => {
    Object.defineProperty(window, "matchMedia", {
      value: jest.fn(() => {
        return {
          matches: true,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn()
        };
      })
    });
  });

  test("renders chip correctly", () => {
    render(
      <MockTheme>
        <BasicChip label="" />
      </MockTheme>
    );
  });

  test("renders chip with correct label", () => {
    render(
      <MockTheme>
        <BasicChip label="Chip" />
      </MockTheme>
    );
    expect(screen.getByText("Chip")).toBeInTheDocument();
  });

  test("renders chip when id is assigned", () => {
    render(
      <MockTheme>
        <BasicChip label="Chip" id="test" dataTestId="basic-chip" />
      </MockTheme>
    );
    const chip = screen.getByTestId("basic-chip");
    expect(chip).toBeInTheDocument();
    expect(chip).toHaveAttribute("id", "test");
  });

  test("renders truncated label (first 2 words) when isResponsive is true and screen width is medium", () => {
    render(
      <MockTheme>
        <BasicChip label="Long Label Text" isResponsive={true} />
      </MockTheme>
    );
    const truncatedText = screen.getByText("Long Label");
    expect(truncatedText).toBeInTheDocument();
  });

  test("renders full label when isResponsive is false", () => {
    render(
      <MockTheme>
        <BasicChip label="Long Label Text" isResponsive={false} />
      </MockTheme>
    );
    const fullText = screen.getByText("Long Label Text");
    expect(fullText).toBeInTheDocument();
  });

  test("handles onclick event", () => {
    const handleClick = jest.fn();
    render(
      <MockTheme>
        <BasicChip label="Clickable Chip" onClick={handleClick} />
      </MockTheme>
    );
    const chip = screen.getByText("Clickable Chip");
    fireEvent.click(chip);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("check whether tooltip open and close when hovering if isTooltip is enabled", async () => {
    render(
      <MockTheme>
        <BasicChip label="Test Tooltip" isTooltipEnabled={true} />
      </MockTheme>
    );
    const chip = screen.getByText("Test Tooltip");

    fireEvent.mouseEnter(chip);
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toBeVisible();

    fireEvent.mouseLeave(chip);

    await waitFor(() => {
      expect(tooltip).not.toBeVisible();
    });
  });

  test("applies custom styles passed via the styles prop", () => {
    const customStyles = { fontSize: "12px" };
    render(
      <MockTheme>
        <BasicChip
          label="Custom Chip"
          dataTestId="basic-chip"
          chipStyles={customStyles}
        />
      </MockTheme>
    );
    const chip = screen.getByTestId("basic-chip");
    expect(chip).toHaveStyle("font-size: 12px");
  });
});
