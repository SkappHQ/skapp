import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SignInForm from "./SignInForm";

jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (key: string[]) => key[0]
}));
userEvent;

describe("SignInForm Component", () => {
  const handleChange = jest.fn();
  const handleInput = jest.fn();
  const defaultProps = {
    handleChange,
    handleInput,
    values: {
      email: "",
      password: ""
    },
    errors: {
      email: "",
      password: ""
    }
  };

  it("renders the form fields", () => {
    render(<SignInForm {...defaultProps} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("displays the correct email value", () => {
    render(
      <SignInForm
        {...defaultProps}
        values={{ email: "test@example.com", password: "" }}
      />
    );

    const emailInput = screen.getByLabelText(/emailLabel/i) as HTMLInputElement;
    expect(emailInput.value).toBe("test@example.com");
  });

  it("displays the correct password value", () => {
    render(
      <SignInForm
        {...defaultProps}
        values={{ email: "", password: "password123" }}
      />
    );

    const passwordInput = screen.getByLabelText(
      /passwordLabel/i
    ) as HTMLInputElement;
    expect(passwordInput.value).toBe("password123");
  });

  it("calls handleChange when the email field changes", () => {
    render(<SignInForm {...defaultProps} />);

    const emailInput = screen.getByLabelText(/emailLabel/i);
    fireEvent.change(emailInput, { target: { value: "new@example.com" } });

    expect(handleChange).toHaveBeenCalledWith(expect.any(Object));
  });

  it("calls handleInput when typing in the email field", () => {
    render(<SignInForm {...defaultProps} />);

    const emailInput = screen.getByLabelText(/emailLabel/i);
    fireEvent.input(emailInput, { target: { value: "new@example.com" } });

    expect(handleInput).toHaveBeenCalledWith(expect.any(Object));
  });

  it("toggles password visibility when clicking the visibility icon", async () => {
    render(<SignInForm {...defaultProps} />);

    const visibilityButton = screen.getByRole("button", { hidden: true });
    const passwordInput = screen.getByLabelText(
      /passwordLabel/i
    ) as HTMLInputElement;

    expect(passwordInput.type).toBe("password");

    userEvent.click(visibilityButton);

    await waitFor(() => expect(passwordInput.type).toBe("text"));

    userEvent.click(visibilityButton);

    await waitFor(() => expect(passwordInput.type).toBe("password"));
  });

  it("displays email and password errors", () => {
    render(
      <SignInForm
        {...defaultProps}
        errors={{ email: "Invalid email", password: "Password is required" }}
      />
    );

    expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });
});
