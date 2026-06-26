import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";

import TimeInput from "./TimeInput";

describe("TimeInput", () => {
  test("renders the TimeInput with label", () => {
    render(
      <TimeInput time={new Date()} setTime={jest.fn()} label="Select Time" />
    );
    expect(screen.getByText("Select Time")).toBeInTheDocument();
  });

  test("displays error message when error prop is provided", () => {
    render(
      <TimeInput
        time={new Date()}
        setTime={jest.fn()}
        label="Select Time"
        error="Invalid time"
      />
    );
    expect(screen.getByText("Invalid time")).toBeInTheDocument();
  });
});
