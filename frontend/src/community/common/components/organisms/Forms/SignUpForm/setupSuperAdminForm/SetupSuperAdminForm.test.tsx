import "@testing-library/jest-dom/extend-expect";
import { act, fireEvent, render, screen } from "@testing-library/react";

import MockTheme from "~community/common/mocks/MockTheme";

import SetupSuperAdminForm from "./SetupSuperAdminForm";

jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (key: string) => {
    const translations: Record<string, string> = {
      firstNameLabel: "First name",
      lastNameLabel: "Last name",
      emailLabel: "Work Email",
      passwordLabel: "Password"
    };
    return translations[key] || key;
  }
}));

const mockProps = {
  handleChange: jest.fn(),
  handleInput: jest.fn(),
  errors: {},
  values: {
    firstName: "Test",
    lastName: "Test",
    workEmail: "",
    password: "pasWord1!"
  }
};

describe("SetupSuperAdminForm", () => {
  test("renders SetupSuperAdminForm correctly", () => {
    render(
      <MockTheme>
        <SetupSuperAdminForm {...mockProps} />
      </MockTheme>
    );
  });

  test("renders the form with all inputs SetupSuperAdminForm", () => {
    render(
      <MockTheme>
        <SetupSuperAdminForm {...mockProps} />
      </MockTheme>
    );
    expect(screen.getByText("First name")).toBeInTheDocument();
    expect(screen.getByText("Last name")).toBeInTheDocument();
    expect(screen.getByText("Work Email")).toBeInTheDocument();
    expect(screen.getByText("Password")).toBeInTheDocument();
  });

  test("calls handleChange when typing in first name input", async () => {
    render(
      <MockTheme>
        <SetupSuperAdminForm {...mockProps} />
      </MockTheme>
    );
    const input = screen.getByLabelText("First name");
    await act(async () => {
      fireEvent.change(input, { target: { value: "Tester" } });
    });
    expect(mockProps.handleChange).toHaveBeenCalled();
  });

  test("calls handleChange when typing in last name input", async () => {
    render(
      <MockTheme>
        <SetupSuperAdminForm {...mockProps} />
      </MockTheme>
    );
    const input = screen.getByLabelText("Last name");
    await act(async () => {
      fireEvent.change(input, { target: { value: "Tester" } });
    });
    expect(mockProps.handleChange).toHaveBeenCalled();
  });

  test("calls handleChange when typing in work email input", async () => {
    render(
      <MockTheme>
        <SetupSuperAdminForm {...mockProps} />
      </MockTheme>
    );
    const input = screen.getByLabelText("Work Email");
    await act(async () => {
      fireEvent.change(input, { target: { value: "test@mail.com" } });
    });
    expect(mockProps.handleChange).toHaveBeenCalled();
  });

  test("calls handleChange when typing in password input", async () => {
    render(
      <MockTheme>
        <SetupSuperAdminForm {...mockProps} />
      </MockTheme>
    );
    const input = screen.getByLabelText("Password");
    await act(async () => {
      fireEvent.change(input, { target: { value: "password" } });
    });
    expect(mockProps.handleChange).toHaveBeenCalled();
  });

  test("displays error messages when fields have errors", () => {
    const errorProps = {
      ...mockProps,
      errors: {
        firstName: "Please enter the first name",
        lastName: "Please enter the last name",
        email: "Please enter the work email",
        password: "Please enter the password"
      }
    };
    render(
      <MockTheme>
        <SetupSuperAdminForm {...errorProps} />
      </MockTheme>
    );
    expect(screen.getByText("Please enter the first name")).toBeInTheDocument();
    expect(screen.getByText("Please enter the last name")).toBeInTheDocument();
    expect(screen.getByText("Please enter the work email")).toBeInTheDocument();
    expect(screen.getByText("Please enter the password")).toBeInTheDocument();
  });

  test("toggles password visibility when icon button is clicked", async () => {
    render(
      <MockTheme>
        <SetupSuperAdminForm {...mockProps} />
      </MockTheme>
    );

    const passwordInput = screen.getByLabelText("Password");
    expect(passwordInput).toHaveAttribute("type", "password");

    const visibilityToggleButton = screen.getByRole("button");

    await act(async () => {
      fireEvent.mouseDown(visibilityToggleButton);
    });
    expect(passwordInput).toHaveAttribute("type", "text");

    await act(async () => {
      fireEvent.mouseUp(visibilityToggleButton);
    });
    expect(passwordInput).toHaveAttribute("type", "password");
  });
});
