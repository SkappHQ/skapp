import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

import MockTheme from "~community/common/mocks/MockTheme";

import SwitchRow from "./SwitchRow";

describe("SwitchRow", () => {
  test("renders the switch with label", () => {
    render(
      <MockTheme>
        <SwitchRow
          label="Test Switch"
          checked={false}
          onChange={jest.fn()}
          labelId="test-switch-label"
        />
      </MockTheme>
    );
    expect(screen.getByLabelText("Test Switch")).toBeInTheDocument();
  });

  test("calls onChange handler when toggled", async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();
    render(
      <MockTheme>
        <SwitchRow
          label="Toggle Switch"
          checked={false}
          onChange={handleChange}
          labelId="toggle-switch-label"
        />
      </MockTheme>
    );
    const switchInput = screen.getByRole("checkbox");
    await user.click(switchInput);
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  test("disables the switch when disabled is true", () => {
    render(
      <MockTheme>
        <SwitchRow
          label="Disabled Switch"
          checked={false}
          onChange={jest.fn()}
          disabled={true}
          labelId="disabled-switch-label"
        />
      </MockTheme>
    );
    const switchInput = screen.getByRole("checkbox");
    expect(switchInput).toBeDisabled();
  });

  test("renders error message when error prop is provided", () => {
    render(
      <MockTheme>
        <SwitchRow
          label="Error Switch"
          checked={false}
          onChange={jest.fn()}
          error="This is an error"
          labelId="error-switch-label"
        />
      </MockTheme>
    );
    expect(screen.getByText("This is an error")).toBeInTheDocument();
  });

  test("applies custom wrapper styles", () => {
    const customStyles = { backgroundColor: "lightgray" };
    render(
      <MockTheme>
        <SwitchRow
          label="Styled Switch"
          checked={false}
          onChange={jest.fn()}
          wrapperStyles={customStyles}
          labelId="styled-switch-label"
        />
      </MockTheme>
    );
    const wrapper = screen.getByText("Styled Switch").closest("div");
    expect(wrapper).toHaveStyle("background-color: lightgray");
  });
});
