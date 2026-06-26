import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";

import IconChip from "./IconChip";

describe("Icon Chip", () => {
  beforeAll(() => {
    Object.defineProperty(window, "matchMedia", {
      value: jest.fn(() => {
        return {
          matches: true,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn()
        };
      })
    });
  });

  test("renders chip correctly", () => {
    render(<IconChip />);
  });

  test("renders chip with correct label", () => {
    render(<IconChip label="Chip" />);
    expect(screen.getByText("Chip")).toBeInTheDocument();
  });

  test("handles onclick event", () => {
    const handleClick = jest.fn();
    render(<IconChip label="Chip" onClick={handleClick} />);
    const chip = screen.getByText("Chip");
    fireEvent.click(chip);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("should truncate the label when isTruncated is true and label length exceeds 10 characters", () => {
    render(<IconChip label="This is a long label" isTruncated={true} />);
    const chip = screen.getByText("This is a ...");
    expect(chip).toBeInTheDocument();
  });

  test("should not truncate the label when isTruncated is false", () => {
    render(<IconChip label="This is a long label" isTruncated={false} />);
    const chip = screen.getByText("This is a long label");
    expect(chip).toBeInTheDocument();
  });

  test("applies custom styles passed via the styles prop", () => {
    const customStyles = { fontSize: "12px" };
    render(
      <IconChip
        label="Chip"
        dataTestId="basic-chip"
        chipStyles={customStyles}
      />
    );
    const chip = screen.getByTestId("basic-chip");
    expect(chip).toHaveStyle("font-size: 12px");
  });

  test("should apply textTransform prop correctly", () => {
    render(
      <IconChip label="Chip" dataTestId="test" textTransform="uppercase" />
    );
    const chip = screen.getByTestId("test");
    expect(chip).toHaveStyle("text-transform: uppercase");
  });

  test("should hide the label when isResponsive is true on medium screen", () => {
    render(<IconChip label="Chip" isResponsive={true} />);
    const chip = screen.queryByText("Chip");
    expect(chip).toBeNull();
  });

  test("should not hide the label when isResponsive is false", () => {
    render(<IconChip label="Chip" isResponsive={false} />);
    const chip = screen.getByText("Chip");
    expect(chip).toBeInTheDocument();
  });

  test("should render the chip with the emoji size if provided", () => {
    render(<IconChip label="Chip" dataTestId="test" emojiSize="2rem" />);
    const chip = screen.getByTestId("test");
    expect(chip).toHaveStyle("font-size: 2rem");
  });
});
