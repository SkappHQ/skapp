import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";

import MockTheme from "~community/common/mocks/MockTheme";
import { theme } from "~community/common/theme/theme";

import ColoredCircle from "./ColoredCircle";

describe("Colored Circle", () => {
  test("renders colored circle correctly", () => {
    const handleClick = jest.fn();
    render(
      <ColoredCircle color="red" onClick={handleClick} isSelected={true} />
    );
  });

  test("renders colored circle with check icon when isSelected is true", () => {
    const handleClick = jest.fn();
    render(
      <ColoredCircle color="red" onClick={handleClick} isSelected={true} />
    );
    const check = screen.getByTestId("checkIcon");
    expect(check).toBeInTheDocument();
  });

  test("renders colored circle without check icon when isSelected is false", () => {
    const handleClick = jest.fn();
    render(
      <ColoredCircle color="red" onClick={handleClick} isSelected={false} />
    );
    const check = screen.queryByTestId("checkIcon");
    expect(check).not.toBeInTheDocument();
  });

  test("chceck whether the check icon color is set as secondary", () => {
    const handleClick = jest.fn();
    render(
      <MockTheme>
        <ColoredCircle color="red" onClick={handleClick} isSelected={true} />
      </MockTheme>
    );
    const check = screen.getByTestId("checkIcon");
    expect(check).toHaveStyle(`color: ${theme.palette.secondary.main}`);
  });

  test("check whether colored circle is clicked", () => {
    const handleClick = jest.fn();
    render(
      <MockTheme>
        <ColoredCircle
          color="red"
          onClick={handleClick}
          isSelected={true}
          dataTestId="coloredCircle"
        />
      </MockTheme>
    );
    const circle = screen.getByTestId("coloredCircle");
    fireEvent.click(circle);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("check whether correct color is set", () => {
    const handleClick = jest.fn();
    render(
      <MockTheme>
        <ColoredCircle
          color="red"
          onClick={handleClick}
          isSelected={true}
          dataTestId="coloredCircle"
        />
      </MockTheme>
    );
    const circle = screen.getByTestId("coloredCircle");
    expect(circle).toHaveStyle("background-color: red");
  });
});
