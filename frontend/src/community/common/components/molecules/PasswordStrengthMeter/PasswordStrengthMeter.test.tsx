import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import { PasswordStrength } from "~community/common/constants/stringConstants";
import MockTheme from "~community/common/mocks/MockTheme";
import { theme } from "~community/common/theme/theme";

import PasswordStrengthMeter from "./PasswordStrengthMeter";

jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (key: any[]) => key[0]
}));

describe("PasswordStrengthMeter", () => {
  const renderComponent = (password: string) => {
    return render(
      <MockTheme theme={theme}>
        <PasswordStrengthMeter password={password} />
      </MockTheme>
    );
  };

  it("renders without crashing", () => {
    renderComponent("");
    expect(screen.getByText("PasswordStrength")).toBeInTheDocument();
  });

  it("displays correct strength for a weak password", () => {
    renderComponent("weak");
    expect(screen.getByText(PasswordStrength.Weak)).toBeInTheDocument();
  });

  it("displays correct strength for a decent password", () => {
    renderComponent("Decent1");
    expect(screen.getByText(PasswordStrength.Decent)).toBeInTheDocument();
  });

  it("displays correct strength for a great password", () => {
    renderComponent("Great1Pass!");
    expect(screen.getByText(PasswordStrength.Great)).toBeInTheDocument();
  });

  it("shows correct validation icons for a strong password", () => {
    renderComponent("Great1Pass!");
    const checkCircleIcons = screen.getAllByTestId("CheckCircleIcon");
    expect(checkCircleIcons).toHaveLength(5);
    expect(
      screen.queryByTestId("RadioButtonUncheckedIcon")
    ).not.toBeInTheDocument();
  });

  it("shows mixed validation icons for a partially valid password", () => {
    renderComponent("Weak1");
    const checkCircleIcons = screen.getAllByTestId("CheckCircleIcon");
    const radioButtonUncheckedIcons = screen.getAllByTestId(
      "RadioButtonUncheckedIcon"
    );
    expect(checkCircleIcons).toHaveLength(3);
    expect(radioButtonUncheckedIcons).toHaveLength(2);
  });

  it("updates strength meter when password changes", () => {
    const { rerender } = renderComponent("weak");
    expect(screen.getByText(PasswordStrength.Weak)).toBeInTheDocument();

    rerender(
      <MockTheme theme={theme}>
        <PasswordStrengthMeter password="StrongPass1!" />
      </MockTheme>
    );
    expect(screen.getByText(PasswordStrength.Great)).toBeInTheDocument();
  });

  it("displays all validation criteria", () => {
    renderComponent("");
    expect(screen.getByText("lowercase")).toBeInTheDocument();
    expect(screen.getByText("uppercase")).toBeInTheDocument();
    expect(screen.getByText("number")).toBeInTheDocument();
    expect(screen.getByText("length")).toBeInTheDocument();
    expect(screen.getByText("specialChar")).toBeInTheDocument();
  });
});
