import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

import DefaultAvatar from "./DefaultAvatar";

describe("DefaultAvatar", () => {
  test("renders initials when firstName and lastName are provided", () => {
    render(<DefaultAvatar firstName="John" lastName="Doe" />);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  test("renders AccountCircleIcon when firstName or lastName is missing", () => {
    const { container } = render(<DefaultAvatar firstName="" lastName="" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  test("applies custom typography styles", () => {
    const typographyStyles = { fontSize: "20px" };
    render(
      <DefaultAvatar
        firstName="John"
        lastName="Doe"
        typographyStyles={typographyStyles}
      />
    );
    const initials = screen.getByText("JD");
    expect(initials).toHaveStyle("font-size: 20px");
  });

  test("applies custom container styles", () => {
    const containerStyles = { backgroundColor: "red" };
    const { container } = render(
      <DefaultAvatar
        firstName="John"
        lastName="Doe"
        containerStyles={containerStyles}
      />
    );
    expect(container.firstChild).toHaveStyle("background-color: red");
  });

  test("calls onClick handler when clicked", async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    render(
      <DefaultAvatar firstName="John" lastName="Doe" onClick={handleClick} />
    );
    const avatar = screen.getByText("JD");
    await user.click(avatar);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("calls onMouseEnter handler when hovered", async () => {
    const handleMouseEnter = jest.fn();
    const user = userEvent.setup();
    render(
      <DefaultAvatar
        firstName="John"
        lastName="Doe"
        onMouseEnter={handleMouseEnter}
      />
    );
    const avatar = screen.getByText("JD");
    await user.hover(avatar);
    expect(handleMouseEnter).toHaveBeenCalledTimes(1);
  });
});
