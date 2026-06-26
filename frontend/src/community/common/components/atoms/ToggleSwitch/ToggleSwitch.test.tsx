import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

import ToggleSwitch from "./ToggleSwitch";

describe("ToggleSwitch", () => {
  const options = ["Option 1", "Option 2", "Option 3"];
  const setCategoryOption = jest.fn();

  test("renders all options", () => {
    render(
      <ToggleSwitch
        options={options}
        setCategoryOption={setCategoryOption}
        categoryOption="Option 1"
      />
    );
    options.forEach((option) => {
      expect(screen.getByText(option)).toBeInTheDocument();
    });
  });

  test("calls setCategoryOption when an option is clicked", async () => {
    const user = userEvent.setup();
    render(
      <ToggleSwitch
        options={options}
        setCategoryOption={setCategoryOption}
        categoryOption="Option 1"
      />
    );
    const optionToClick = screen.getByText("Option 3");
    await user.click(optionToClick);
    expect(setCategoryOption).toHaveBeenCalledWith("Option 3");
  });

  test("applies custom container styles", () => {
    const customStyles = { backgroundColor: "lightblue" };
    render(
      <ToggleSwitch
        options={options}
        setCategoryOption={setCategoryOption}
        categoryOption="Option 1"
        containerStyles={customStyles}
      />
    );
    const container = screen.getByText("Option 1").closest("div");
    expect(container).toHaveStyle("background-color: lightblue");
  });

  test("applies custom text styles", () => {
    const customTextStyles = (isSelected?: boolean) =>
      isSelected ? { color: "green" } : { color: "gray" };
    render(
      <ToggleSwitch
        options={options}
        setCategoryOption={setCategoryOption}
        categoryOption="Option 2"
        textStyles={customTextStyles}
      />
    );
    expect(screen.getByText("Option 2")).toHaveStyle("color: green");
    expect(screen.getByText("Option 1")).toHaveStyle("color: gray");
  });
});
