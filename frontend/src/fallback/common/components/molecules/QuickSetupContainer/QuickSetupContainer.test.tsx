import { render } from "@testing-library/react";

import QuickSetupContainer from "./QuickSetupContainer";

describe("QuickSetupContainer", () => {
  it("matches the snapshot", () => {
    const { asFragment } = render(<QuickSetupContainer />);
    expect(asFragment()).toMatchSnapshot();
  });

  // Placeholder for future tests when props or states are added
  it("handles future props or states correctly", () => {
    // Example: If props like `title` or `content` are added in the future
    // const { getByText } = render(<QuickSetupContainer title="Setup" content="Details" />);
    // expect(getByText("Setup")).toBeInTheDocument();
  });
});
