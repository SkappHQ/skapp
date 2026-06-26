import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";

import DragAndDropField from "./DragAndDropField";

jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (key: string) => {
    const translations: Record<string, string> = {};
    return translations[key] || key;
  }
}));

describe("DragAndDropField", () => {
  test("renders DragAndDropField correctly", () => {
    const handleAttachments = jest.fn();
    render(
      <DragAndDropField
        setAttachments={handleAttachments}
        uploadableFiles={[]}
        accept={{ "image/*": [".png", ".gif", ".jpeg", ".jpg"] }}
      />
    );
  });

  test("renders label correctly", () => {
    const handleAttachments = jest.fn();
    render(
      <DragAndDropField
        label="Upload Logo"
        setAttachments={handleAttachments}
        uploadableFiles={[]}
        accept={{ "image/*": [".png", ".gif", ".jpeg", ".jpg"] }}
      />
    );
    const label = screen.getByText("Upload Logo");
    expect(label).toBeInTheDocument();
  });

  test("displays custom error message when provided", () => {
    const handleAttachments = jest.fn();
    render(
      <DragAndDropField
        label="Upload Logo"
        setAttachments={handleAttachments}
        customError="custom error"
        uploadableFiles={[]}
        accept={{ "image/*": [".png", ".gif", ".jpeg", ".jpg"] }}
      />
    );
    const customError = screen.getByText("custom error");
    expect(customError).toBeInTheDocument();
  });
});
