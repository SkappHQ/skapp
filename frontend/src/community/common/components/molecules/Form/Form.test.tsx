import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";

import Form from "./Form";

describe("Form", () => {
  test("renders Form correctly", () => {
    render(
      <Form>
        <input type="text" name="name" />
        <button type="submit">Submit</button>
      </Form>
    );
  });

  test("check whether children (input and button) are rendered correctly", () => {
    render(
      <Form>
        <input type="text" name="name" placeholder="Enter your name" />
        <button type="submit">Submit</button>
      </Form>
    );
    const placeholder = screen.getByPlaceholderText("Enter your name");
    expect(placeholder).toBeInTheDocument();
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  test("check onSubmit function", () => {
    const handleSubmit = jest.fn();
    render(
      <Form onSubmit={handleSubmit}>
        <input type="text" name="name" />
        <button type="submit">Submit</button>
      </Form>
    );
    const button = screen.getByRole("button");
    fireEvent.submit(button);
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });
});
