import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";

import { TooltipPlacement } from "~community/common/enums/ComponentEnums";

import Tooltip from "./Tooltip";

describe("Tooltip", () => {
  test("renders Tooltip correctly", () => {
    render(
      <Tooltip title="">
        <button>Hover Me</button>
      </Tooltip>
    );
  });

  test("renders Tooltip correctly with the provided text when open is true", () => {
    render(
      <Tooltip title="Test Tooltip" open={true}>
        <button>Hover Me</button>
      </Tooltip>
    );
    const tooltip = screen.getByText("Test Tooltip");
    expect(tooltip).toBeInTheDocument();
  });

  test("renders Tooltip when open is true", () => {
    render(
      <Tooltip title="Test Tooltip" open={true}>
        <button>Hover Me</button>
      </Tooltip>
    );
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toBeVisible();
  });

  test("does not render Tooltip when open is false", () => {
    render(
      <Tooltip title="Test Tooltip" open={false}>
        <button>Hover Me</button>
      </Tooltip>
    );
    const tooltip = screen.queryByRole("tooltip");
    expect(tooltip).not.toBeInTheDocument();
  });

  test("renders JSX element as title", () => {
    const jsxText = <span>JSX Tooltip</span>;
    render(
      <Tooltip title={jsxText} open={true}>
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.getByText("JSX Tooltip")).toBeInTheDocument();
  });

  test("applies correct placement", () => {
    render(
      <Tooltip
        title="Test Tooltip"
        placement={TooltipPlacement.RIGHT}
        open={true}
      >
        <button>Hover me</button>
      </Tooltip>
    );
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toHaveAttribute("data-popper-placement", "right");
  });
});
