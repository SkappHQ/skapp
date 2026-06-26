import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";

import MockTheme from "~community/common/mocks/MockTheme";

import SupervisorSelector from "./SupervisorSelector";

jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (key: string[]) => key[key.length - 1]
}));

describe("SupervisorSelector", () => {
  const mockSetSelectedManagers = jest.fn();
  const mockSetFilterEl = jest.fn();
  const mockSetManagerSearchTerm = jest.fn();
  const mockOnManagerSearchChange = jest.fn();

  const defaultProps = {
    employee: null,
    otherSupervisorsCount: 0,
    managerSuggestions: [],
    managerSearchTerm: "",
    onmanagerSearchChange: mockOnManagerSearchChange,
    selectedManagers: [],
    setSelectedManagers: mockSetSelectedManagers,
    isInputsDisabled: false,
    label: "Supervisors",
    filterEl: null,
    setFilterEl: mockSetFilterEl,
    setManagerSearchTerm: mockSetManagerSearchTerm,
    isSearchResultsLoading: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the label correctly", () => {
    render(
      <MockTheme>
        <SupervisorSelector {...defaultProps} />
      </MockTheme>
    );

    expect(screen.getByText("Supervisors")).toBeInTheDocument();
  });

  test("renders placeholder text when no supervisors are selected", () => {
    render(
      <MockTheme>
        <SupervisorSelector {...defaultProps} />
      </MockTheme>
    );

    expect(screen.getByText("selectOtherSupervisors")).toBeInTheDocument();
  });
});
