import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

import SortRow from "./SortRow";

describe("SortRow", () => {
  test("renders the sort row with provided text", () => {
    render(
      <SortRow text="Test Sort Row" selected={false} onClick={jest.fn()} />
    );
    expect(screen.getByText("Test Sort Row")).toBeInTheDocument();
  });

  test("calls onClick handler when clicked", async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    render(
      <SortRow
        text="Clickable Sort Row"
        selected={false}
        onClick={handleClick}
      />
    );
    const sortRow = screen.getByText("Clickable Sort Row");
    await user.click(sortRow);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("applies selected styles when selected is true", () => {
    render(
      <SortRow text="Selected Sort Row" selected={true} onClick={jest.fn()} />
    );
    const sortRow = screen.getByText("Selected Sort Row");
    expect(sortRow).toHaveClass("MuiTypography-root");
  });

  test("does not render start icon when isStartIcon is false", () => {
    render(
      <SortRow
        text="Sort Row without Icon"
        selected={false}
        onClick={jest.fn()}
        isStartIcon={false}
      />
    );
    expect(
      screen.queryByTestId("icon-remove-circle-icon")
    ).not.toBeInTheDocument();
  });

  test("does not render selected icon when showSelectedIcon is false", () => {
    render(
      <SortRow
        text="Selected Sort Row without Icon"
        selected={true}
        onClick={jest.fn()}
        showSelectedIcon={false}
      />
    );
    expect(
      screen.queryByTestId("icon-check-circle-icon")
    ).not.toBeInTheDocument();
  });

  test("applies custom text styles", () => {
    const textStyles = { color: "blue" };
    render(
      <SortRow
        text="Styled Sort Row"
        selected={false}
        onClick={jest.fn()}
        textStyles={textStyles}
      />
    );
    const sortRow = screen.getByText("Styled Sort Row");
    expect(sortRow).toHaveStyle("color: blue");
  });
});
