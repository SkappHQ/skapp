import { render } from "@testing-library/react";

import { MarkOutOfOfficeModal } from "./MarkOutOfOfficeModal";

describe("MarkOutOfOfficeModal", () => {
  it("renders an empty fragment", () => {
    const { container } = render(<MarkOutOfOfficeModal />);
    expect(container.firstChild).toBeNull();
  });
});
