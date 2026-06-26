import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React, { ReactNode } from "react";

import MockTheme from "~community/common/mocks/MockTheme";

import ResetPasswordForm from "./ResetPasswordForm";

jest.mock("~community/common/hooks/usePasswordVisibilityToggle", () => ({
  __esModule: true,
  default: () => ({
    getPasswordType: jest.fn(() => "password"),
    getPasswordVisibilityState: jest.fn(() => false),
    togglePasswordVisibility: jest.fn()
  })
}));

jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (key: string) => key
}));

jest.mock("~community/common/components/molecules/Form/Form", () => {
  const MockForm = ({ children }: { children: ReactNode }) => (
    <div data-testid="form">{children}</div>
  );
  MockForm.displayName = "MockForm";
  return MockForm;
});

jest.mock(
  "~community/common/components/molecules/InputField/InputField",
  () => {
    const MockInputField = ({
      label,
      inputName,
      value,
      onChange,
      onBlur,
      error
    }: {
      label: string;
      inputName: string;
      value: string;
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
      onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
      error?: string;
    }) => (
      <div data-testid={`input-${inputName}`}>
        <label>{label}</label>
        <input
          name={inputName}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
        />
        {error && <span>{error}</span>}
      </div>
    );
    MockInputField.displayName = "MockInputField";
    return MockInputField;
  }
);

const defaultProps = {
  handleChange: jest.fn(),
  handleBlur: jest.fn(),
  values: {
    password: "",
    confirmPassword: ""
  },
  errors: {},
  touched: {}
};

const renderComponent = (props = {}) => {
  return render(
    <MockTheme>
      <ResetPasswordForm {...defaultProps} {...props} />
    </MockTheme>
  );
};

describe("ResetPasswordForm", () => {
  it("renders the form with password and confirm password fields", () => {
    renderComponent();
    expect(screen.getByTestId("input-password")).toBeInTheDocument();
    expect(screen.getByTestId("input-confirmPassword")).toBeInTheDocument();
  });

  it("calls handleChange when password is entered", () => {
    const handleChange = jest.fn();
    renderComponent({ handleChange });
    const passwordInput = screen
      .getByTestId("input-password")
      .querySelector("input");
    if (passwordInput) {
      fireEvent.change(passwordInput, { target: { value: "newpassword" } });
    }
    expect(handleChange).toHaveBeenCalled();
  });

  it("displays password strength indicator when password is entered", async () => {
    renderComponent({
      values: { password: "Passw0rd!", confirmPassword: "" }
    });
    await waitFor(() => {
      expect(screen.getByText("PasswordStrength")).toBeInTheDocument();
      expect(screen.getByText("Great")).toBeInTheDocument();
    });
  });

  it("shows error message for confirm password when touched and not matching", () => {
    renderComponent({
      values: { password: "password", confirmPassword: "differentpassword" },
      errors: { confirmPassword: "Passwords do not match" },
      touched: { confirmPassword: true }
    });
    expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
  });

  it("updates password validation items as password is entered", async () => {
    const { rerender } = renderComponent();

    expect(screen.queryByText("lowercase")).not.toBeInTheDocument();

    rerender(
      <MockTheme>
        <ResetPasswordForm
          {...defaultProps}
          values={{ password: "Passw0rd!", confirmPassword: "" }}
        />
      </MockTheme>
    );

    await waitFor(() => {
      expect(screen.getByText("lowercase")).toBeInTheDocument();
      expect(screen.getByText("uppercase")).toBeInTheDocument();
      expect(screen.getByText("number")).toBeInTheDocument();
      expect(screen.getByText("length")).toBeInTheDocument();
      expect(screen.getByText("specialChar")).toBeInTheDocument();
    });
  });
});
