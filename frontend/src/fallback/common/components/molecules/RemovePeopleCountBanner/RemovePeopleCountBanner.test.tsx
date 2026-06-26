import { render } from "@testing-library/react";

import RemovePeopleCountBanner from "./RemovePeopleCountBanner";

describe("RemovePeopleCountBanner", () => {
  it("matches the snapshot", () => {
    const { asFragment } = render(<RemovePeopleCountBanner />);
    expect(asFragment()).toMatchSnapshot();
  });

  // Placeholder for future tests when props or states are added
  it("handles future props or states correctly", () => {
    // Example: If props like `message` or `count` are added in the future
    // const { getByText } = render(<RemovePeopleCountBanner message="Warning" count={5} />);
    // expect(getByText("Warning")).toBeInTheDocument();
  });
});
