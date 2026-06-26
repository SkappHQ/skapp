import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

import Pagination from "./Pagination";

describe("Pagination", () => {
  test("renders the pagination component", () => {
    render(<Pagination totalPages={5} currentPage={0} onChange={jest.fn()} />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  test("disables the pagination when isDisabled is true", () => {
    render(
      <Pagination
        totalPages={5}
        currentPage={0}
        onChange={jest.fn()}
        isDisabled={true}
      />
    );
    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  test("calls onChange handler when a page is clicked", async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();
    render(
      <Pagination totalPages={5} currentPage={0} onChange={handleChange} />
    );
    const page2Button = screen.getByText("2");
    await user.click(page2Button);
    expect(handleChange).toHaveBeenCalledWith(expect.anything(), 2);
  });

  test("hides page numbers when isNumbersVisible is false", () => {
    render(
      <Pagination
        totalPages={5}
        currentPage={0}
        onChange={jest.fn()}
        isNumbersVisible={false}
      />
    );
    expect(screen.queryByText("1")).not.toBeInTheDocument();
    expect(screen.queryByText("2")).not.toBeInTheDocument();
  });

  test("applies custom styles passed via paginationStyles prop", () => {
    const customStyles = { backgroundColor: "red" };
    render(
      <Pagination
        totalPages={5}
        currentPage={0}
        onChange={jest.fn()}
        paginationStyles={customStyles}
      />
    );
    const navigation = screen.getByRole("navigation");
    expect(navigation).toHaveStyle("background-color: red");
  });
});
