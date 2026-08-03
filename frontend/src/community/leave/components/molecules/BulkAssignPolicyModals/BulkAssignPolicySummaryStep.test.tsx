import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";
import { ReactNode } from "react";

import { BulkAssignPolicyResponse } from "~community/leave/types/LeavePolicyTypes";
import { downloadBulkAssignErrorReport } from "~community/leave/utils/bulkAssignPolicyUtils";

import BulkAssignPolicySummaryStep from "./BulkAssignPolicySummaryStep";

// skapp-ui ships ESM only, which the CommonJS test resolver cannot load.
jest.mock(
  "@rootcodelabs/skapp-ui",
  () => ({
    ButtonV2: ({
      children,
      onClick,
      disabled
    }: {
      children: ReactNode;
      onClick?: () => void;
      disabled?: boolean;
    }) => (
      <button onClick={onClick} disabled={disabled}>
        {children}
      </button>
    )
  }),
  { virtual: true }
);

jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (keys: string[]) => keys[0]
}));

jest.mock("~community/leave/utils/bulkAssignPolicyUtils", () => ({
  downloadBulkAssignErrorReport: jest.fn()
}));

const buildResponse = (
  successCount: number,
  failedCount: number
): BulkAssignPolicyResponse => ({
  bulkStatusSummary: { successCount, failedCount },
  bulkRecordErrorLogs: []
});

describe("BulkAssignPolicySummaryStep", () => {
  beforeEach(() => jest.clearAllMocks());

  test("shows the all-success summary and hides the error report action", () => {
    render(
      <BulkAssignPolicySummaryStep
        response={buildResponse(3, 0)}
        onDone={jest.fn()}
      />
    );

    expect(screen.getByText("summaryAllSuccess")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "downloadErrorReportBtnTxt" })
    ).not.toBeInTheDocument();
  });

  test("shows the partial summary when some rows failed", () => {
    render(
      <BulkAssignPolicySummaryStep
        response={buildResponse(2, 1)}
        onDone={jest.fn()}
      />
    );

    expect(screen.getByText("summaryPartial")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "downloadErrorReportBtnTxt" })
    ).toBeInTheDocument();
  });

  test("shows the all-failed summary when nothing was assigned", () => {
    render(
      <BulkAssignPolicySummaryStep
        response={buildResponse(0, 4)}
        onDone={jest.fn()}
      />
    );

    expect(screen.getByText("summaryAllFailed")).toBeInTheDocument();
  });

  test("downloads the error report on request", () => {
    const response = buildResponse(0, 4);
    render(
      <BulkAssignPolicySummaryStep response={response} onDone={jest.fn()} />
    );

    fireEvent.click(
      screen.getByRole("button", { name: "downloadErrorReportBtnTxt" })
    );

    expect(downloadBulkAssignErrorReport).toHaveBeenCalledWith(response);
  });

  test("closes the modal when done is clicked", () => {
    const onDone = jest.fn();
    render(
      <BulkAssignPolicySummaryStep
        response={buildResponse(3, 0)}
        onDone={onDone}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "doneBtnTxt" }));

    expect(onDone).toHaveBeenCalled();
  });
});
