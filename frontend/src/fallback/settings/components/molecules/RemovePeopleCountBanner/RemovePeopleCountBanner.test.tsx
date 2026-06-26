import { render } from "@testing-library/react";

import RemovePeopleCountBanner from "./RemovePeopleCountBanner";

describe("RemovePeopleCountBanner", () => {
  it("renders without crashing", () => {
    const { container } = render(<RemovePeopleCountBanner />);
    expect(container.firstChild).toBeDefined();
  });

  it("renders an empty fragment", () => {
    const { container } = render(<RemovePeopleCountBanner />);
    expect(container.firstChild).toBeNull();
  });
});
