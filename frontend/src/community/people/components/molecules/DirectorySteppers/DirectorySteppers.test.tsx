import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";

import MockTheme from "~community/common/mocks/MockTheme";

import DirectorySteppers from "./DirectorySteppers";

// Mock hooks and functions
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        roles: ["LEAVE_ADMIN", "ATTENDANCE_ADMIN"]
      }
    }
  }))
}));

jest.mock("~community/people/api/PeopleApi", () => ({
  useGetSupervisedByMe: jest.fn(() => ({
    data: {
      isPrimaryManager: true,
      isSecondaryManager: false,
      isTeamSupervisor: false
    },
    isLoading: false
  }))
}));

jest.mock("~community/people/store/store", () => ({
  usePeopleStore: jest.fn(() => ({
    setNextStep: jest.fn(),
    currentStep: 0
  }))
}));

jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (key: string[]) => key.join(".")
}));

describe("DirectorySteppers", () => {
  test("renders limited steps for individual view", () => {
    render(
      <MockTheme>
        <DirectorySteppers employeeId={1} isIndividualView={true} />
      </MockTheme>
    );

    expect(screen.getByText("editAllInfo.personal")).toBeInTheDocument();
    expect(screen.getByText("editAllInfo.employment")).toBeInTheDocument();
    expect(screen.queryByText("editAllInfo.emergency")).not.toBeInTheDocument();
    expect(
      screen.queryByText("editAllInfo.systemPermissions")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("editAllInfo.timeline")).not.toBeInTheDocument();
  });

  test("does not render leave or timesheet steps if user lacks permissions", () => {
    jest.mocked(require("next-auth/react").useSession).mockReturnValue({
      data: {
        user: {
          roles: []
        }
      }
    });

    render(
      <MockTheme>
        <DirectorySteppers employeeId={1} />
      </MockTheme>
    );

    expect(screen.queryByText("editAllInfo.leave")).not.toBeInTheDocument();
    expect(screen.queryByText("editAllInfo.timesheet")).not.toBeInTheDocument();
  });
});
