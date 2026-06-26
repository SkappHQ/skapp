import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

import { FilledArrow } from "./FilledArrow";

describe("FilledArrow", () => {
  test("renders right arrow by default", () => {
    render(<FilledArrow onClick={jest.fn()} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  test("renders left arrow when isRightArrow is false", () => {
    render(<FilledArrow onClick={jest.fn()} isRightArrow={false} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  test("calls onClick handler when clicked", async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    render(<FilledArrow onClick={handleClick} />);
    const button = screen.getByRole("button");
    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("does not call onClick handler when disabled", async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    render(<FilledArrow onClick={handleClick} disabled={true} />);
    const button = screen.getByRole("button");
    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  test("applies custom background color", () => {
    render(<FilledArrow onClick={jest.fn()} backgroundColor="red" />);
    const button = screen.getByRole("button");
    expect(button).toHaveStyle("background-color: red");
  });

  test("sets aria-disabled when disabled", () => {
    render(<FilledArrow onClick={jest.fn()} disabled={true} />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-disabled", "true");
  });

  test("sets correct tabIndex when disabled", () => {
    render(<FilledArrow onClick={jest.fn()} disabled={true} />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("tabindex", "-1");
  });

  test("sets correct tabIndex when enabled", () => {
    render(<FilledArrow onClick={jest.fn()} disabled={false} tabIndex={2} />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("tabindex", "2");
  });
});
