/**
 * @jest-environment node
 */
import { createXlsxBytes } from "../xlsxUtils";

const readText = (bytes: Uint8Array): string => new TextDecoder().decode(bytes);

const sheets = [
  {
    name: "Template",
    columnWidth: 24,
    rows: [
      ["Employee Email", "Policy ID", "Effective Date"],
      ["john.doe@company.com", "12", "01/06/2026"]
    ]
  },
  {
    name: "Resource",
    rows: [
      ["Policy ID", "Policy Name", "Leave Type"],
      [12, "Annual & Co <Policy>", "Annual"]
    ]
  }
];

describe("createXlsxBytes", () => {
  it("writes a ZIP container holding every workbook part", () => {
    const bytes = createXlsxBytes(sheets);
    const text = readText(bytes);

    // Local file header signature: the file really is a ZIP archive.
    expect(Array.from(bytes.slice(0, 4))).toEqual([0x50, 0x4b, 0x03, 0x04]);
    expect(text).toContain("[Content_Types].xml");
    expect(text).toContain("xl/workbook.xml");
    expect(text).toContain("xl/_rels/workbook.xml.rels");
    expect(text).toContain("xl/worksheets/sheet1.xml");
    expect(text).toContain("xl/worksheets/sheet2.xml");
  });

  it("names one tab per sheet", () => {
    const text = readText(createXlsxBytes(sheets));

    expect(text).toContain('<sheet name="Template" sheetId="1" r:id="rId1"/>');
    expect(text).toContain('<sheet name="Resource" sheetId="2" r:id="rId2"/>');
  });

  it("writes text as inline strings and numbers as numeric cells", () => {
    const text = readText(createXlsxBytes(sheets));

    expect(text).toContain(
      '<c r="A1" t="inlineStr"><is><t xml:space="preserve">Employee Email</t></is></c>'
    );
    expect(text).toContain('<c r="A2"><v>12</v></c>');
  });

  it("escapes characters that would break the sheet XML", () => {
    const text = readText(createXlsxBytes(sheets));

    expect(text).toContain("Annual &amp; Co &lt;Policy&gt;");
  });

  it("sets the requested column width only where one was given", () => {
    const text = readText(createXlsxBytes(sheets));

    expect(text).toContain('<col min="1" max="3" width="24" customWidth="1"/>');
    expect(text.match(/<cols>/g)).toHaveLength(1);
  });
});
