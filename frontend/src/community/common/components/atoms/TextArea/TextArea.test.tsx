import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

import TextArea from "./TextArea";

describe("TextArea", () => {
  test("renders the TextArea with label", () => {
    render(
      <TextArea
        label="Test Label"
        name="test-textarea"
        value=""
        onChange={jest.fn()}
        maxLength={100}
      />
    );
    expect(screen.getByText("Test Label")).toBeInTheDocument();
  });

  test("displays a required asterisk when isRequired is true", () => {
    render(
      <TextArea
        label="Required Field"
        name="required-textarea"
        value=""
        onChange={jest.fn()}
        isRequired={true}
        maxLength={100}
      />
    );
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  test("does not display a required asterisk when isRequired is false", () => {
    render(
      <TextArea
        label="Optional Field"
        name="optional-textarea"
        value=""
        onChange={jest.fn()}
        isRequired={false}
        maxLength={100}
      />
    );
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  test("calls onChange handler when text is entered", async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();
    render(
      <TextArea
        label="Editable Field"
        name="editable-textarea"
        value=""
        onChange={handleChange}
        maxLength={100}
      />
    );
    const textarea = screen.getByPlaceholderText("");
    await user.type(textarea, "Hello");
    expect(handleChange).toHaveBeenCalledTimes(5); // Called for each character
  });

  test("displays an error message when error prop is provided", () => {
    render(
      <TextArea
        label="Error Field"
        name="error-textarea"
        value=""
        onChange={jest.fn()}
        error={{ comment: "This is an error" }}
        maxLength={100}
      />
    );
    expect(screen.getByText("This is an error")).toBeInTheDocument();
  });
});
