import { render } from "@testing-library/react";

import LogoColorLoader from "./LogoColorLoader";

describe("LogoColorLoader", () => {
  it("matches the snapshot", () => {
    const { asFragment } = render(<LogoColorLoader />);
    expect(asFragment()).toMatchSnapshot();
  });

  // Placeholder for future tests when props or states are added
  it("handles future props or states correctly", () => {
    // Example: If props like `color` or `size` are added in the future
    // const { getByTestId } = render(<LogoColorLoader color="blue" size="large" />);
    // expect(getByTestId("logo-color-loader")).toHaveStyle("color: blue");
  });
});
