import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import MockTheme from "~community/common/mocks/MockTheme";
import { AbsenceRateKpiTypes } from "~community/leave/enums/AnalyticsEnums";

import AbsenceRateCard from "./AbsenceRateCard";

jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (keys: string[]) => keys.join(".")
}));

describe("AbsenceRateCard", () => {
  test("renders the current rate and the trend", () => {
    render(
      <MockTheme>
        <AbsenceRateCard
          absenceRate={{
            type: AbsenceRateKpiTypes.CURRENT_ABSENCE_RATE,
            currentAbsenceRate: 13.333,
            monthBeforeAbsenceRate: 10
          }}
          isLoading={false}
          isError={false}
        />
      </MockTheme>
    );

    expect(screen.getByText("absenceRate")).toBeInTheDocument();
    expect(screen.getByText("13.3 %")).toBeInTheDocument();
    expect(screen.getByText("10% trend")).toBeInTheDocument();
  });

  test("renders a dash when there is no rate", () => {
    render(
      <MockTheme>
        <AbsenceRateCard
          absenceRate={{ currentAbsenceRate: null }}
          isLoading={false}
          isError={false}
        />
      </MockTheme>
    );

    expect(screen.getByText("-")).toBeInTheDocument();
  });

  test("renders only the title while loading", () => {
    render(
      <MockTheme>
        <AbsenceRateCard isLoading={true} isError={false} />
      </MockTheme>
    );

    expect(screen.getByText("absenceRate")).toBeInTheDocument();
    expect(screen.queryByText("-")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("renders an error message when the request fails", () => {
    render(
      <MockTheme>
        <AbsenceRateCard isLoading={false} isError={true} />
      </MockTheme>
    );

    expect(screen.getByRole("alert")).toHaveTextContent("somethingWentWrong");
    expect(screen.queryByText("-")).not.toBeInTheDocument();
  });
});
