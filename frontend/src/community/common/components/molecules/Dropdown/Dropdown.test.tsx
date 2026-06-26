import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";

import MockTheme from "~community/common/mocks/MockTheme";

import Dropdown from "./Dropdown";

describe("Dropdown", () => {
  const items = ["Item 1", "Item 2", "Item 3"];
  const selectedItem = "Item 2";
  const onItemClickMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the dropdown button with the correct title", () => {
    render(
      <MockTheme>
        <Dropdown
          title="Select an item"
          items={items}
          onItemClick={onItemClickMock}
          selectedItem={selectedItem}
        />
      </MockTheme>
    );

    const button = screen.getByRole("button", { name: /Select an item/i });
    expect(button).toBeInTheDocument();
  });

  test("opens the dropdown popper when the button is clicked", () => {
    render(
      <MockTheme>
        <Dropdown
          title="Select an item"
          items={items}
          onItemClick={onItemClickMock}
          selectedItem={selectedItem}
        />
      </MockTheme>
    );

    const button = screen.getByRole("button", { name: /Select an item/i });
    fireEvent.click(button);

    const dropdownItems = screen.getAllByTestId(/selectable-item-/i);
    expect(dropdownItems).toHaveLength(items.length);
  });

  test("closes the dropdown popper when the button is clicked again", () => {
    render(
      <MockTheme>
        <Dropdown
          title="Select an item"
          items={items}
          onItemClick={onItemClickMock}
          selectedItem={selectedItem}
        />
      </MockTheme>
    );

    const button = screen.getByRole("button", { name: /Select an item/i });
    fireEvent.click(button);

    const dropdownItems = screen.getAllByTestId(/selectable-item-/i)[0];
    expect(dropdownItems).toBeVisible();

    fireEvent.click(button);
    expect(dropdownItems).not.toBeVisible();
  });

  test("calls onItemClick when an item is clicked", () => {
    render(
      <MockTheme>
        <Dropdown
          title="Select an item"
          items={items}
          onItemClick={onItemClickMock}
          selectedItem={selectedItem}
        />
      </MockTheme>
    );

    const button = screen.getByRole("button", { name: /Select an item/i });
    fireEvent.click(button);

    const itemToClick = screen.getAllByTestId(/selectable-item-/i)[0];
    fireEvent.click(itemToClick);

    expect(onItemClickMock).toHaveBeenCalledTimes(1);
  });

  test("does not open the dropdown when disabled", () => {
    render(
      <MockTheme>
        <Dropdown
          title="Select an item"
          items={items}
          onItemClick={onItemClickMock}
          selectedItem={selectedItem}
          disabled={true}
        />
      </MockTheme>
    );

    const button = screen.getByRole("button", { name: /Select an item/i });
    expect(button).toBeDisabled();
  });
});
