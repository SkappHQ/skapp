import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";

import MockTheme from "~community/common/mocks/MockTheme";

import EmojiChip from "./EmojiChip";

describe("EmojiChip", () => {
  test("applies title styles passed via the 'titleStyles' prop", () => {
    const titleStyles = { fontWeight: "bold" };
    render(
      <MockTheme>
        <EmojiChip name="Styled Name" emoji="😊" titleStyles={titleStyles} />
      </MockTheme>
    );
    const nameElement = screen.getByText("Styled Name");
    expect(nameElement).toHaveStyle("font-weight: 700");
  });

  test("applies container styles passed via the 'containerStyles' prop", () => {
    const containerStyles = { backgroundColor: "red" };
    render(
      <MockTheme>
        <EmojiChip
          name="Styled Container"
          emoji="😊"
          containerStyles={containerStyles}
        />
      </MockTheme>
    );
    const container = screen.getByText("Styled Container").parentElement;
    expect(container).toHaveStyle("background-color: red");
  });

  test("renders CircularProgress with correct rotation for MORNING leaveType", () => {
    render(
      <MockTheme>
        <EmojiChip name="Morning Leave" emoji="🌞" leaveType="MORNING" />
      </MockTheme>
    );
    const progress = screen.getByRole("progressbar");
    expect(progress).toHaveStyle("transform: rotate(-90deg)");
  });

  test("renders CircularProgress with correct rotation for EVENING leaveType", () => {
    render(
      <MockTheme>
        <EmojiChip name="Evening Leave" emoji="🌙" leaveType="EVENING" />
      </MockTheme>
    );
    const progress = screen.getByRole("progressbar");
    expect(progress).toHaveStyle("transform: rotate(-90deg)");
  });

  test("renders CircularProgress with full progress for other leaveTypes", () => {
    render(
      <MockTheme>
        <EmojiChip name="Full Day Leave" emoji="🌍" leaveType="FULL_DAY" />
      </MockTheme>
    );
    const progress = screen.getByRole("progressbar");
    expect(progress).toHaveAttribute("aria-valuenow", "100");
  });
});
