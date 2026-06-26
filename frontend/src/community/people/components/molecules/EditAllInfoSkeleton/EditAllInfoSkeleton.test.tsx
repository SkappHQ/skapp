import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";

import MockTheme from "~community/common/mocks/MockTheme";

import EditAllInfoSkeleton from "./EditAllInfoSkeleton";

describe("EditAllInfoSkeleton", () => {
  test("renders the skeleton component", () => {
    render(
      <MockTheme>
        <EditAllInfoSkeleton />
      </MockTheme>
    );
  });
});
