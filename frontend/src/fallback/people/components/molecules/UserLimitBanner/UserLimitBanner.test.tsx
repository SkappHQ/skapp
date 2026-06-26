import { render } from "@testing-library/react";

import { UserLimitBanner } from "./UserLimitBanner";

describe("UserLimitBanner", () => {
  it("renders an empty fragment", () => {
    const { container } = render(<UserLimitBanner />);
    expect(container.firstChild).toBeNull();
  });
});
