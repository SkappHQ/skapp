import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";

import DropdownSearch from "./DropDownSearch";

const mockItemList = [
  { label: "Option 1", value: "value1" },
  { label: "Option 2", value: "value2" }
];

describe("DropDownSearch", () => {
  test("renders DropDownSearch correctly", () => {
    render(
      <DropdownSearch inputName="dropdown" itemList={mockItemList} value="" />
    );
  });

  test("renders DropDownSearch with the correct label", () => {
    render(
      <DropdownSearch
        inputName="dropdown"
        label="Select Option"
        itemList={mockItemList}
        value=""
      />
    );
    const label = screen.getByText("Select Option");
    expect(label).toBeInTheDocument();
  });

  test("renders DropDownSearch with the correct placeholder", () => {
    render(
      <DropdownSearch
        inputName="dropdown"
        placeholder="dropdown-placeholder"
        itemList={mockItemList}
        value=""
      />
    );
    const placeholder = screen.getByText("dropdown-placeholder");
    expect(placeholder).toBeInTheDocument();
  });

  test("renders DropDownSearch with the correct option list", () => {
    render(
      <DropdownSearch
        inputName="dropdown"
        placeholder="Select an option"
        itemList={mockItemList}
        value=""
      />
    );
    const dropdown = screen.getByText("Select an option");
    fireEvent.mouseDown(dropdown);

    const option1 = screen.getByText("Option 1");
    expect(option1).toBeInTheDocument();
    const option2 = screen.getByText("Option 2");
    expect(option2).toBeInTheDocument();
  });

  test("check whether onChange is called with the value when an option is selected", () => {
    const handleChange = jest.fn();
    render(
      <DropdownSearch
        inputName="dropdown"
        placeholder="Select an option"
        onChange={handleChange}
        itemList={mockItemList}
        value=""
      />
    );
    const dropdown = screen.getByText("Select an option");
    fireEvent.mouseDown(dropdown);

    const option = screen.getByText("Option 1");
    fireEvent.click(option);
    expect(handleChange).toHaveBeenCalledWith("value1");
  });

  test("check whether error message is displayed when error prop is passed", () => {
    const handleChange = jest.fn();
    render(
      <DropdownSearch
        inputName="dropdown"
        placeholder="Select an option"
        error="This is required"
        onChange={handleChange}
        itemList={mockItemList}
        value=""
      />
    );
    const error = screen.getByText("This is required");
    expect(error).toBeInTheDocument();
  });

  test("display No results when item list is empty", () => {
    render(
      <DropdownSearch
        inputName="dropdown"
        placeholder="Select an option"
        itemList={[]}
        value=""
      />
    );
    const dropdown = screen.getByText("Select an option");
    fireEvent.mouseDown(dropdown);
    const message = screen.getByText("No options");
    expect(message).toBeInTheDocument();
  });
});
