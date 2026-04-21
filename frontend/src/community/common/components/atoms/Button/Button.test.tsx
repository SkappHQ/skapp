import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import MockTheme from "~community/common/mocks/MockTheme";

import Button from "./Button";

describe("Button", () => {
  test("renders button correctly", () => {
    render(
      <MockTheme>
        <ButtonV2 label="Click Me" buttonStyle={ButtonStyle.SECONDARY} />
      </MockTheme>
    );
  });

  test("renders button with correct label", () => {
    render(
      <MockTheme>
        <ButtonV2 label="Click Me" buttonStyle={ButtonStyle.SECONDARY} />
      </MockTheme>
    );
    expect(screen.getByText("Click Me")).toBeInTheDocument();
  });

  test("check onClick functionality of button", async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    render(
      <MockTheme>
        <ButtonV2
          label="Click Me"
          buttonStyle={ButtonStyle.SECONDARY}
          onClick={handleClick}
        />
      </MockTheme>
    );
    const button = screen.getByRole("button");
    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("checks whether the button is disabled", () => {
    render(
      <MockTheme>
        <ButtonV2 label="Disabled Button" disabled={true} />
      </MockTheme>
    );
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  test("displays endIcon when not loading", () => {
    render(
      <MockTheme>
        <ButtonV2
          label="Icon Button"
          startIcon={<span>StartIcon</span>}
          endIcon={<span>EndIcon</span>}
          isLoading={false}
        />
      </MockTheme>
    );
    expect(screen.getByText("StartIcon")).toBeInTheDocument();
    expect(screen.getByText("EndIcon")).toBeInTheDocument();
  });

  test("does not display startIcon and endIcon when loading", () => {
    render(
      <MockTheme>
        <ButtonV2
          label="Icon Button"
          endIcon={<span>EndIcon</span>}
          isLoading={true}
        />
      </MockTheme>
    );
    expect(screen.queryByText("EndIcon")).not.toBeInTheDocument();
  });

  test("displays CircularProgress when loading is true", () => {
    render(
      <MockTheme>
        <ButtonV2
          label="Progress Button"
          isLoading={true}
          endIcon={<span>EndIcon</span>}
        />
      </MockTheme>
    );
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  test("does not display CircularProgress when loading is false", () => {
    render(
      <MockTheme>
        <ButtonV2 label="Progress Button" isLoading={false} />
      </MockTheme>
    );
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  test("applies custom styles passed via the styles prop", () => {
    const customStyles = { borderRadius: "2px" };
    render(
      <MockTheme>
        <ButtonV2 label="Icon Button" styles={customStyles} />
      </MockTheme>
    );
    const button = screen.getByRole("button");
    expect(button).toHaveStyle("border-radius: 2px");
  });
});
