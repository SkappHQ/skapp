import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";

import InputField from "./InputField";

describe("InputField", () => {
  test("renders InputField correctly", () => {
    render(<InputField inputName="input" value="value" />);
  });

  test("check whether label in InputField is rendered correctly", () => {
    render(<InputField inputName="input" label="Name" value="value" />);
    const label = screen.getByLabelText("Name");
    expect(label).toBeInTheDocument();
  });

  test("check whether placeholder in InputField is rendered correctly", () => {
    render(
      <InputField
        inputName="input"
        placeHolder="Enter the name"
        value="value"
      />
    );
    const label = screen.getByPlaceholderText("Enter the name");
    expect(label).toBeInTheDocument();
  });

  test("check whether onChange is called when input value is changed", () => {
    const handleChange = jest.fn();
    render(
      <InputField inputName="input" onChange={handleChange} value="value" />
    );
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "New Value" } });
    expect(handleChange).toHaveBeenCalled();
  });

  test("trims the white space in input value on change for text type", () => {
    const handleChange = jest.fn();
    const { rerender } = render(
      <InputField
        inputName="input"
        onChange={handleChange}
        inputType="text"
        value="value"
      />
    );
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "   Trimmed" } });
    expect(handleChange).toHaveBeenCalled();
    rerender(
      <InputField
        inputName="input"
        onChange={handleChange}
        inputType="text"
        value="Trimmed"
      />
    );
    expect(input).toHaveValue("Trimmed");
  });

  test("replaces the white space in input value on change for password type", () => {
    const handleChange = jest.fn();
    const { rerender } = render(
      <InputField
        inputName="input"
        onChange={handleChange}
        placeHolder="Enter password"
        inputType="password"
        value="value"
      />
    );
    const input = screen.getByPlaceholderText("Enter password");
    fireEvent.change(input, { target: { value: "  pass word " } });
    expect(handleChange).toHaveBeenCalled();
    rerender(
      <InputField
        inputName="input"
        onChange={handleChange}
        placeHolder="Enter password"
        inputType="password"
        value="password"
      />
    );
    expect(input).toHaveValue("password");
  });

  test("restricts number input based on min and max", () => {
    const handleChange = jest.fn();
    const { rerender } = render(
      <InputField
        inputName="input"
        onChange={handleChange}
        placeHolder="Enter number"
        inputType="number"
        min={1}
        max={10}
        value="value"
      />
    );
    const input = screen.getByPlaceholderText("Enter number");
    fireEvent.change(input, { target: { value: "11" } });
    expect(handleChange).toHaveBeenCalled();
    rerender(
      <InputField
        inputName="input"
        onChange={handleChange}
        inputType="number"
        min={1}
        max={10}
        value="10"
      />
    );
    expect(input).toHaveValue(10);
  });

  test("check whether helper text in InputField is rendered correctly", () => {
    render(
      <InputField inputName="input" helperText="Helper Text" value="value" />
    );
    const helper = screen.getByText("Helper Text");
    expect(helper).toBeInTheDocument();
  });

  test("check whether error message in InputField is rendered correctly", () => {
    render(
      <InputField inputName="input" error="This is required" value="value" />
    );
    const error = screen.getByText("This is required");
    expect(error).toBeInTheDocument();
  });

  test("displays the tooltip when tooltip is provided", () => {
    render(
      <InputField
        inputName="input"
        tooltip="This is tooltip"
        open={true}
        value="value"
      />
    );
    const tooltip = screen.getByText("This is tooltip");
    expect(tooltip).toBeInTheDocument();
  });

  test("focuses the input when focusOnText is true", () => {
    render(<InputField inputName="input" focusOnText={true} value="value" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveFocus();
  });

  test("check whether the input field is disabled when isDisabled is true", () => {
    render(<InputField inputName="input" isDisabled={true} value="value" />);
    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
  });
});
