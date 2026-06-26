import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

import MockTheme from "~community/common/mocks/MockTheme";

import Checkbox from "./Checkbox";

describe("Checkbox", () => {
  test("renders checkbox with label", () => {
    render(
      <MockTheme>
        <Checkbox
          checked={false}
          name="test-checkbox"
          label="Test Checkbox"
          onChange={jest.fn()}
        />
      </MockTheme>
    );
    expect(screen.getByText("Test Checkbox")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  test("checkbox is checked when 'checked' prop is true", () => {
    render(
      <MockTheme>
        <Checkbox
          checked={true}
          name="test-checkbox"
          label="Checked Checkbox"
          onChange={jest.fn()}
        />
      </MockTheme>
    );
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  test("checkbox is not checked when 'checked' prop is false", () => {
    render(
      <MockTheme>
        <Checkbox
          checked={false}
          name="test-checkbox"
          label="Unchecked Checkbox"
          onChange={jest.fn()}
        />
      </MockTheme>
    );
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  test("calls onChange handler when clicked", async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();
    render(
      <MockTheme>
        <Checkbox
          checked={false}
          name="test-checkbox"
          label="Clickable Checkbox"
          onChange={handleChange}
        />
      </MockTheme>
    );
    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  test("checkbox is disabled when 'disabled' prop is true", () => {
    render(
      <MockTheme>
        <Checkbox
          checked={false}
          name="test-checkbox"
          label="Disabled Checkbox"
          onChange={jest.fn()}
          disabled={true}
        />
      </MockTheme>
    );
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeDisabled();
  });

  test("applies label styles passed via the 'labelStyles' prop", () => {
    const labelStyles = { fontWeight: "bold" };
    render(
      <MockTheme>
        <Checkbox
          checked={false}
          name="test-checkbox"
          label="Styled Label"
          onChange={jest.fn()}
          labelStyles={labelStyles}
        />
      </MockTheme>
    );
    const label = screen.getByText("Styled Label");
    expect(label).toHaveStyle("font-weight: 400");
  });
});
