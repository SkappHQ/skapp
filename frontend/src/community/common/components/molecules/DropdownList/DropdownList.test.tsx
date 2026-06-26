import { ThemeProvider, createTheme } from "@mui/material/styles";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { ReactElement } from "react";

import DropdownList from "./DropdownList";

// Create a custom render function that includes the theme provider
const theme = createTheme();

const mockItemList = [
  { label: "Option 1", value: "1" },
  { label: "Option 2", value: "2" },
  { label: "Option 3", value: "3" }
];

const defaultProps = {
  inputName: "test-dropdown",
  itemList: mockItemList
};

const renderWithTheme = (component: ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe("DropdownList", () => {
  it("renders with basic props", () => {
    renderWithTheme(<DropdownList {...defaultProps} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("displays label when provided", () => {
    const label = "Test Label";
    renderWithTheme(<DropdownList {...defaultProps} label={label} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("shows required asterisk when required prop is true", () => {
    renderWithTheme(
      <DropdownList {...defaultProps} label="Test Label" required />
    );
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("displays placeholder when no value is selected", () => {
    const placeholder = "Select an option";
    renderWithTheme(
      <DropdownList {...defaultProps} placeholder={placeholder} />
    );
    expect(screen.getByText(placeholder)).toBeInTheDocument();
  });

  it("shows error message when error prop is provided", () => {
    const errorMessage = "This field is required";
    renderWithTheme(<DropdownList {...defaultProps} error={errorMessage} />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("calls onChange handler when option is selected", () => {
    const handleChange = jest.fn();
    renderWithTheme(<DropdownList {...defaultProps} onChange={handleChange} />);

    const select = screen.getByRole("combobox");
    fireEvent.mouseDown(select);

    const options = screen.getAllByRole("option");
    fireEvent.click(options[0]);

    expect(handleChange).toHaveBeenCalled();
  });

  it("renders tooltip when provided", () => {
    const title = "Helpful tooltip";
    renderWithTheme(<DropdownList {...defaultProps} tooltip={title} />);

    const tooltip = screen.getByLabelText("Helpful tooltip");
    expect(tooltip).toBeInTheDocument();
  });

  it("disables the dropdown when isDisabled is true", () => {
    renderWithTheme(<DropdownList {...defaultProps} isDisabled />);
    const select = screen.getByRole("combobox");
    expect(select).toHaveAttribute("aria-disabled", "true");
  });

  it('renders "Add New" button when addNewClickBtnText is provided', () => {
    const addNewText = "Add New Option";
    const handleAddNew = jest.fn();
    renderWithTheme(
      <DropdownList
        {...defaultProps}
        addNewClickBtnText={addNewText}
        onAddNewClickBtn={handleAddNew}
      />
    );

    const select = screen.getByRole("combobox");
    fireEvent.mouseDown(select);

    const addNewButton = screen.getByText(addNewText);
    expect(addNewButton).toBeInTheDocument();

    fireEvent.click(addNewButton);
    expect(handleAddNew).toHaveBeenCalled();
  });
});
