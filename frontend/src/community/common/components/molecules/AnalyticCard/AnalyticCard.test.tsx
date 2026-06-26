import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";

import MockTheme from "~community/common/mocks/MockTheme";

import AnalyticCard from "./AnalyticCard";

// Import MockTheme

describe("AnalyticCard", () => {
  test("renders the AnalyticCard with a title", () => {
    render(
      <MockTheme>
        <AnalyticCard title="Test Title" />
      </MockTheme>
    );
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  test("renders children inside the AnalyticCard", () => {
    render(
      <MockTheme>
        <AnalyticCard>
          <div>Child Content</div>
        </AnalyticCard>
      </MockTheme>
    );
    expect(screen.getByText("Child Content")).toBeInTheDocument();
  });
});
