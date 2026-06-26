import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";

import { ThemeTypes } from "~community/common/types/AvailableThemeColors";

import SetupOrganizationForm from "./SetupOrganizationForm";

jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (key: string) => {
    const translations: Record<string, string> = {
      orgDetailsSubHeading: "Organization Details",
      companyNameLabel: "Company name",
      companyWebsiteLabel: "Company website",
      countryLabel: "Country",
      brandingSubHeading: "Branding",
      themeColorLabel: "Workplace theme color",
      themeColorTooltip:
        "The workplace theme will be reflected throughout your system"
    };
    return translations[key] || key;
  }
}));

const mockProps = {
  handleSubmit: jest.fn(),
  handleChange: jest.fn(),
  handleInput: jest.fn(),
  errors: {},
  values: {},
  countryArr: [
    { label: "USA", value: "usa" },
    { label: "UK", value: "uk" }
  ],
  handleCountrySelect: jest.fn(),
  companyLogo: [],
  setAttachments: jest.fn(),
  colorInputValue: ThemeTypes.BLUE_THEME
};

describe("SetupOrganisationForm", () => {
  test("renders SetupOrganisationForm correctly", () => {
    render(<SetupOrganizationForm {...mockProps} />);
  });

  test("renders the form with all inputs SetupOrganisationForm", () => {
    render(<SetupOrganizationForm {...mockProps} />);
    expect(screen.getByText("Company name")).toBeInTheDocument();
    expect(screen.getByText("Company website")).toBeInTheDocument();
    expect(screen.getByText("Country")).toBeInTheDocument();
    expect(screen.getByText("Workplace theme color")).toBeInTheDocument();
  });

  test("check whether handleSubmit is called when the form is submitted", () => {
    const { container } = render(<SetupOrganizationForm {...mockProps} />);
    const form = container.querySelector("form");
    form && fireEvent.submit(form);
    expect(mockProps.handleSubmit).toHaveBeenCalled();
  });

  test("calls handleChange when typing in organization name input", () => {
    render(<SetupOrganizationForm {...mockProps} />);
    const input = screen.getByLabelText("Company name");
    fireEvent.change(input, { target: { value: "New Company" } });
    expect(mockProps.handleChange).toHaveBeenCalled();
  });

  test("calls handleChange when typing in organization website input", () => {
    render(<SetupOrganizationForm {...mockProps} />);
    const input = screen.getByLabelText("Company website");
    fireEvent.change(input, { target: { value: "www.website.com" } });
    expect(mockProps.handleChange).toHaveBeenCalled();
  });

  test("renders country dropdown with the correct option list", () => {
    render(<SetupOrganizationForm {...mockProps} />);
    const dropdown = screen.getByText("Select Country");
    fireEvent.mouseDown(dropdown);

    const option1 = screen.getByText("USA");
    expect(option1).toBeInTheDocument();
    const option2 = screen.getByText("UK");
    expect(option2).toBeInTheDocument();
  });

  test("calls handleChange when selecting a country", () => {
    render(<SetupOrganizationForm {...mockProps} />);
    const dropdown = screen.getByText("Select Country");
    fireEvent.mouseDown(dropdown);

    const option = screen.getByText("USA");
    fireEvent.click(option);
    expect(mockProps.handleCountrySelect).toHaveBeenCalledWith("usa");
  });

  test("calls onSelect when color is selected", () => {
    const handleSelect = jest.fn();
    render(<SetupOrganizationForm {...mockProps} onSelect={handleSelect} />);
    const input = screen.getByTestId(
      `colored-circle-${mockProps.colorInputValue}`
    );
    fireEvent.click(input);
    expect(handleSelect).toHaveBeenCalledWith(
      "themeColor",
      mockProps.colorInputValue
    );
  });

  test("displays error message for organization name when error exists", () => {
    const errorProps = {
      ...mockProps,
      errors: {
        organizationName: "Company name is required"
      }
    };
    render(<SetupOrganizationForm {...errorProps} />);
    const error = screen.getByText("Company name is required");
    expect(error).toBeInTheDocument();
  });

  test("displays error message for organization website when error exists", () => {
    const errorProps = {
      ...mockProps,
      errors: {
        organizationWebsite: "Incorrect website"
      }
    };
    render(<SetupOrganizationForm {...errorProps} />);
    const error = screen.getByText("Incorrect website");
    expect(error).toBeInTheDocument();
  });

  test("displays error message when selecting country when error is passed", () => {
    const errorProps = {
      ...mockProps,
      errors: {
        country: "Country is required"
      }
    };
    render(<SetupOrganizationForm {...errorProps} />);
    const error = screen.getByText("Country is required");
    expect(error).toBeInTheDocument();
  });
});
