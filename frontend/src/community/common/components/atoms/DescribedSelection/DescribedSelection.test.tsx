import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

import DescribedSelection from "./DescribedSelection";

describe("DescribedSelection", () => {
  test("renders the component with title and description", () => {
    render(
      <DescribedSelection
        title="Test Title"
        description="Test Description"
        isSelected={false}
        onClick={jest.fn()}
      />
    );
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  test("calls onClick handler when clicked", async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    render(
      <DescribedSelection
        title="Clickable Title"
        description="Clickable Description"
        isSelected={false}
        onClick={handleClick}
      />
    );
    const container = screen.getByText("Clickable Title").closest("div");
    await user.click(container!);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("renders without description if not provided", () => {
    render(
      <DescribedSelection
        title="Title Only"
        isSelected={false}
        onClick={jest.fn()}
      />
    );
    expect(screen.getByText("Title Only")).toBeInTheDocument();
    expect(screen.queryByText("Test Description")).not.toBeInTheDocument();
  });
});
