import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

import MockTheme from "~community/common/mocks/MockTheme";

import IconButton from "./IconButton";

describe("IconButton", () => {
  test("renders the icon button with provided icon", () => {
    render(
      <MockTheme>
        <IconButton icon={<span>Test Icon</span>} />
      </MockTheme>
    );
    expect(screen.getByText("Test Icon")).toBeInTheDocument();
  });

  test("calls onClick handler when clicked", async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    render(
      <MockTheme>
        <IconButton icon={<span>Test Icon</span>} onClick={handleClick} />
      </MockTheme>
    );
    const button = screen.getByRole("button");
    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("renders text permanently when isTextPermenent is true", () => {
    render(
      <MockTheme>
        <IconButton
          icon={<span>Test Icon</span>}
          text="Permanent Text"
          isTextPermenent
        />
      </MockTheme>
    );
    expect(screen.getByText("Permanent Text")).toBeInTheDocument();
  });

  test("shows text on hover when hoverEffect is true", async () => {
    const user = userEvent.setup();
    render(
      <MockTheme>
        <IconButton
          icon={<span>Test Icon</span>}
          text="Hover Text"
          hoverEffect
        />
      </MockTheme>
    );
    const button = screen.getByRole("button");
    await user.hover(button);
    expect(screen.getByText("Hover Text")).toBeInTheDocument();
  });

  test("applies custom styles passed via buttonStyles prop", () => {
    const customStyles = { backgroundColor: "red" };
    render(
      <MockTheme>
        <IconButton icon={<span>Test Icon</span>} buttonStyles={customStyles} />
      </MockTheme>
    );
    const button = screen.getByRole("button");
    expect(button).toHaveStyle("background-color: red");
  });

  test("applies aria-label when provided", () => {
    render(
      <MockTheme>
        <IconButton icon={<span>Test Icon</span>} ariaLabel="Test Label" />
      </MockTheme>
    );
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Test Label");
  });
});
