import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";

import MockTheme from "~community/common/mocks/MockTheme";

import AnalyticCardSkeleton from "./AnalyticCardSkeleton";

// Import MockTheme

describe("AnalyticCardSkeleton", () => {
  test("renders the AnalyticCardSkeleton without errors", () => {
    render(
      <MockTheme>
        <AnalyticCardSkeleton />
      </MockTheme>
    );
  });
});
