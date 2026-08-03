import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";
import { parse } from "papaparse";
import { ReactNode } from "react";

import BulkAssignPolicyUploadStep from "./BulkAssignPolicyUploadStep";

const mutate = jest.fn();

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

jest.mock("~community/common/providers/ToastProvider", () => ({
  useToast: () => ({ setToastMessage: jest.fn() })
}));

jest.mock("~community/leave/api/LeavePolicyAssignmentApi", () => ({
  useBulkAssignLeavePolicies: () => ({ mutate, isPending: false })
}));

jest.mock("papaparse", () => ({ parse: jest.fn() }));

// Stands in for the drag-and-drop field: exposes the file hand-off and renders the
// error the step feeds back through customError.
jest.mock(
  "~community/common/components/molecules/DragAndDropField/DragAndDropField",
  () => ({
    __esModule: true,
    default: ({
      setAttachments,
      customError
    }: {
      setAttachments: (files: { file: File }[]) => void;
      customError?: string;
    }) => (
      <div>
        <button
          onClick={() =>
            setAttachments([{ file: new File([""], "assignments.csv") }])
          }
        >
          select file
        </button>
        <p>{customError}</p>
      </div>
    )
  })
);

const selectFileParsedAs = (results: {
  data: Record<string, string>[];
  errors: unknown[];
  fields: string[];
}): void => {
  (parse as jest.Mock).mockImplementation((_file, config) =>
    config.complete({
      data: results.data,
      errors: results.errors,
      meta: { fields: results.fields }
    })
  );

  fireEvent.click(screen.getByRole("button", { name: "select file" }));
};

const validRow = {
  "Employee Name": "John Doe",
  "Policy Name": "Annual Leave Policy",
  "Effective Date": "01/06/2026"
};

const templateHeaders = ["Employee Name", "Policy Name", "Effective Date"];

describe("BulkAssignPolicyUploadStep", () => {
  beforeEach(() => jest.clearAllMocks());

  test("keeps the confirm action disabled until a file is parsed", () => {
    render(
      <BulkAssignPolicyUploadStep onComplete={jest.fn()} onBack={jest.fn()} />
    );

    expect(
      screen.getByRole("button", { name: "confirmBtnTxt" })
    ).toBeDisabled();
  });

  test("reports the columns the file is missing", () => {
    render(
      <BulkAssignPolicyUploadStep onComplete={jest.fn()} onBack={jest.fn()} />
    );

    selectFileParsedAs({
      data: [{ "Employee Name": "John Doe" }],
      errors: [],
      fields: ["Employee Name"]
    });

    expect(screen.getByText("missingColumnsError")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "confirmBtnTxt" })
    ).toBeDisabled();
  });

  test("reports a file that has headers but no rows", () => {
    render(
      <BulkAssignPolicyUploadStep onComplete={jest.fn()} onBack={jest.fn()} />
    );

    selectFileParsedAs({ data: [], errors: [], fields: templateHeaders });

    expect(screen.getByText("emptyFileError")).toBeInTheDocument();
  });

  test("reports rows papaparse could not read", () => {
    render(
      <BulkAssignPolicyUploadStep onComplete={jest.fn()} onBack={jest.fn()} />
    );

    selectFileParsedAs({
      data: [validRow],
      errors: [{ type: "FieldMismatch", code: "TooFewFields" }],
      fields: templateHeaders
    });

    expect(screen.getByText("malformedRowsError")).toBeInTheDocument();
  });

  test("reports a file above the supported row count", () => {
    render(
      <BulkAssignPolicyUploadStep onComplete={jest.fn()} onBack={jest.fn()} />
    );

    selectFileParsedAs({
      data: new Array(1001).fill(validRow),
      errors: [],
      fields: templateHeaders
    });

    expect(screen.getByText("tooManyRowsError")).toBeInTheDocument();
  });

  test("submits the parsed rows once a valid file is selected", () => {
    render(
      <BulkAssignPolicyUploadStep onComplete={jest.fn()} onBack={jest.fn()} />
    );

    selectFileParsedAs({
      data: [validRow],
      errors: [],
      fields: templateHeaders
    });

    const confirmButton = screen.getByRole("button", {
      name: "confirmBtnTxt"
    });
    expect(confirmButton).toBeEnabled();

    fireEvent.click(confirmButton);

    expect(mutate).toHaveBeenCalledWith({
      assignments: [
        {
          employeeName: "John Doe",
          policyName: "Annual Leave Policy",
          effectiveDate: "01/06/2026"
        }
      ]
    });
  });
});
