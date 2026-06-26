import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

import MenuItem from "./MenuItem";

describe("MenuItem", () => {
  test("renders the menu item with provided text", () => {
    render(<MenuItem text="Test Item" selected={false} onClick={jest.fn()} />);
    expect(screen.getByText("Test Item")).toBeInTheDocument();
  });

  test("calls onClick handler when clicked", async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    render(
      <MenuItem text="Clickable Item" selected={false} onClick={handleClick} />
    );
    const menuItem = screen.getByText("Clickable Item");
    await user.click(menuItem);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("applies selected styles when selected is true", () => {
    render(
      <MenuItem text="Selected Item" selected={true} onClick={jest.fn()} />
    );
    const menuItem = screen.getByText("Selected Item");
    expect(menuItem).toHaveClass("MuiTypography-root");
  });

  test("applies custom text styles", () => {
    const textStyles = { color: "red" };
    render(
      <MenuItem
        text="Styled Item"
        selected={false}
        onClick={jest.fn()}
        textStyles={textStyles}
      />
    );
    const menuItem = screen.getByText("Styled Item");
    expect(menuItem).toHaveStyle("color: red");
  });
});
