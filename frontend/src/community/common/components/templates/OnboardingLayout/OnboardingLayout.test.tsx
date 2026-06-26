import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";

import MockTheme from "~community/common/mocks/MockTheme";

import OnboardingLayout from "./OnboardingLayout";

jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (key: string) => {
    const translations: Record<string, string> = {
      continueBtnText: "Save and continue"
    };
    return translations[key] || key;
  }
}));

const mockProps = {
  heading: "This is heading",
  subheading: "This is sub heading",
  children: <div>Children Content</div>,
  onClick: jest.fn()
};

describe("OnboardingTemplate", () => {
  test("renders OnboardingTemplate correctly", () => {
    render(
      <MockTheme>
        <OnboardingLayout {...mockProps} />
      </MockTheme>
    );
  });

  test("check whether heading is displayed correctly", () => {
    render(
      <MockTheme>
        <OnboardingLayout {...mockProps} />
      </MockTheme>
    );
    const heading = screen.getByText("This is heading");
    expect(heading).toBeInTheDocument();
  });

  test("check whether subheading is displayed correctly", () => {
    render(
      <MockTheme>
        <OnboardingLayout {...mockProps} />
      </MockTheme>
    );
    const heading = screen.getByText("This is sub heading");
    expect(heading).toBeInTheDocument();
  });

  test("check whether children is being rendered correctly", () => {
    render(
      <MockTheme>
        <OnboardingLayout {...mockProps} />
      </MockTheme>
    );
    const heading = screen.getByText("Children Content");
    expect(heading).toBeInTheDocument();
  });

  test("check whether onClick is being called correctly when the button is clicked", () => {
    render(
      <MockTheme>
        <OnboardingLayout {...mockProps} />
      </MockTheme>
    );
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(mockProps.onClick).toHaveBeenCalled();
  });

  test("check whether button is disabled if isDisabled is true", () => {
    const disabledProps = {
      ...mockProps,
      disabled: true
    };
    render(
      <MockTheme>
        <OnboardingLayout {...disabledProps} />
      </MockTheme>
    );
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });
});
