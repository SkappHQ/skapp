/**
 * Minimal XLSX writer.
 *
 * An .xlsx file is a ZIP of XML parts, so a workbook with several tabs can be
 * built without pulling in a spreadsheet library: the parts below are the
 * smallest set Excel, Google Sheets and LibreOffice accept, and the entries are
 * stored uncompressed so no deflate implementation is needed either.
 */

export type XlsxCellValue = string | number;

export interface XlsxSheet {
  name: string;
  rows: XlsxCellValue[][];
  columnWidth?: number;
}

const XLSX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const XML_HEADER = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';

const SPREADSHEET_NAMESPACE =
  "http://schemas.openxmlformats.org/spreadsheetml/2006/main";

const RELATIONSHIP_NAMESPACE =
  "http://schemas.openxmlformats.org/officeDocument/2006/relationships";

const PACKAGE_RELATIONSHIP_NAMESPACE =
  "http://schemas.openxmlformats.org/package/2006/relationships";

// Excel rejects these in a tab name, and truncates anything past 31 characters.
const INVALID_SHEET_NAME_CHARS_REGEX = /[\\/*?:[\]]/g;

const MAX_SHEET_NAME_LENGTH = 31;

// 1980-01-01, the earliest timestamp the ZIP format can represent. Kept fixed so
// the same workbook always produces the same bytes.
const DOS_DATE = 0x0021;

const DOS_TIME = 0x0000;

const CRC32_POLYNOMIAL = 0xedb88320;

let encoder: TextEncoder | null = null;

// Built on first use so importing this module stays safe where TextEncoder is
// not defined up front (jsdom, for example).
const encode = (value: string): Uint8Array => {
  encoder ??= new TextEncoder();
  return encoder.encode(value);
};

let crc32Table: Uint32Array | null = null;

const getCrc32Table = (): Uint32Array => {
  if (crc32Table) {
    return crc32Table;
  }

  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? (value >>> 1) ^ CRC32_POLYNOMIAL : value >>> 1;
    }
    table[index] = value >>> 0;
  }

  crc32Table = table;
  return table;
};

const crc32 = (bytes: Uint8Array): number => {
  const table = getCrc32Table();
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = (crc >>> 8) ^ table[(crc ^ byte) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const XML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;"
};

// Tab, newline and carriage return are the only control characters XML allows.
const isPrintable = (character: string): boolean => {
  const code = character.charCodeAt(0);
  return code >= 32 || code === 9 || code === 10 || code === 13;
};

const escapeXml = (value: string): string =>
  Array.from(value)
    .filter(isPrintable)
    .map((character) => XML_ESCAPES[character] ?? character)
    .join("");

const toColumnName = (columnIndex: number): string => {
  let name = "";
  let remaining = columnIndex;
  do {
    name = String.fromCharCode(65 + (remaining % 26)) + name;
    remaining = Math.floor(remaining / 26) - 1;
  } while (remaining >= 0);
  return name;
};

const toCellXml = (value: XlsxCellValue, reference: string): string => {
  if (typeof value === "number") {
    return `<c r="${reference}"><v>${value}</v></c>`;
  }
  return `<c r="${reference}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
};

const toSheetXml = ({ rows, columnWidth }: XlsxSheet): string => {
  const columnCount = rows.reduce(
    (widest, row) => Math.max(widest, row.length),
    0
  );

  const columns =
    columnWidth && columnCount > 0
      ? `<cols><col min="1" max="${columnCount}" width="${columnWidth}" customWidth="1"/></cols>`
      : "";

  const sheetRows = rows
    .map((row, rowIndex) => {
      const cells = row
        .map((value, columnIndex) =>
          toCellXml(value, `${toColumnName(columnIndex)}${rowIndex + 1}`)
        )
        .join("");
      return `<row r="${rowIndex + 1}">${cells}</row>`;
    })
    .join("");

  return `${XML_HEADER}<worksheet xmlns="${SPREADSHEET_NAMESPACE}">${columns}<sheetData>${sheetRows}</sheetData></worksheet>`;
};

const toSheetName = (name: string, index: number): string =>
  name
    .replace(INVALID_SHEET_NAME_CHARS_REGEX, "")
    .slice(0, MAX_SHEET_NAME_LENGTH) || `Sheet${index + 1}`;

const toContentTypesXml = (sheets: XlsxSheet[]): string => {
  const overrides = sheets
    .map(
      (_, index) =>
        `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
    )
    .join("");

  return `${XML_HEADER}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${overrides}</Types>`;
};

const toWorkbookXml = (sheets: XlsxSheet[]): string => {
  const sheetTags = sheets
    .map(
      (sheet, index) =>
        `<sheet name="${escapeXml(toSheetName(sheet.name, index))}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`
    )
    .join("");

  return `${XML_HEADER}<workbook xmlns="${SPREADSHEET_NAMESPACE}" xmlns:r="${RELATIONSHIP_NAMESPACE}"><sheets>${sheetTags}</sheets></workbook>`;
};

const toWorkbookRelsXml = (sheets: XlsxSheet[]): string => {
  const relationships = sheets
    .map(
      (_, index) =>
        `<Relationship Id="rId${index + 1}" Type="${RELATIONSHIP_NAMESPACE}/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`
    )
    .join("");

  return `${XML_HEADER}<Relationships xmlns="${PACKAGE_RELATIONSHIP_NAMESPACE}">${relationships}</Relationships>`;
};

const ROOT_RELS_XML = `${XML_HEADER}<Relationships xmlns="${PACKAGE_RELATIONSHIP_NAMESPACE}"><Relationship Id="rId1" Type="${RELATIONSHIP_NAMESPACE}/officeDocument" Target="xl/workbook.xml"/></Relationships>`;

interface ZipEntry {
  path: string;
  content: string;
}

const writeUint16 = (view: DataView, offset: number, value: number): void =>
  view.setUint16(offset, value, true);

const writeUint32 = (view: DataView, offset: number, value: number): void =>
  view.setUint32(offset, value, true);

/** Builds a ZIP archive whose entries are all stored (compression method 0). */
const createZip = (entries: ZipEntry[]): Uint8Array => {
  const files = entries.map((entry) => {
    const nameBytes = encode(entry.path);
    const contentBytes = encode(entry.content);
    return { nameBytes, contentBytes, crc: crc32(contentBytes) };
  });

  const localHeaderSize = 30;
  const centralHeaderSize = 46;
  const endOfDirectorySize = 22;

  const localSize = files.reduce(
    (total, file) =>
      total +
      localHeaderSize +
      file.nameBytes.length +
      file.contentBytes.length,
    0
  );
  const centralSize = files.reduce(
    (total, file) => total + centralHeaderSize + file.nameBytes.length,
    0
  );

  const zip = new Uint8Array(localSize + centralSize + endOfDirectorySize);
  const view = new DataView(zip.buffer);

  let offset = 0;
  const localOffsets: number[] = [];

  for (const file of files) {
    localOffsets.push(offset);

    writeUint32(view, offset, 0x04034b50);
    writeUint16(view, offset + 4, 20);
    writeUint16(view, offset + 6, 0x0800); // file names are UTF-8
    writeUint16(view, offset + 8, 0); // stored, not deflated
    writeUint16(view, offset + 10, DOS_TIME);
    writeUint16(view, offset + 12, DOS_DATE);
    writeUint32(view, offset + 14, file.crc);
    writeUint32(view, offset + 18, file.contentBytes.length);
    writeUint32(view, offset + 22, file.contentBytes.length);
    writeUint16(view, offset + 26, file.nameBytes.length);
    writeUint16(view, offset + 28, 0);
    offset += localHeaderSize;

    zip.set(file.nameBytes, offset);
    offset += file.nameBytes.length;
    zip.set(file.contentBytes, offset);
    offset += file.contentBytes.length;
  }

  const centralDirectoryOffset = offset;

  files.forEach((file, index) => {
    writeUint32(view, offset, 0x02014b50);
    writeUint16(view, offset + 4, 20);
    writeUint16(view, offset + 6, 20);
    writeUint16(view, offset + 8, 0x0800);
    writeUint16(view, offset + 10, 0);
    writeUint16(view, offset + 12, DOS_TIME);
    writeUint16(view, offset + 14, DOS_DATE);
    writeUint32(view, offset + 16, file.crc);
    writeUint32(view, offset + 20, file.contentBytes.length);
    writeUint32(view, offset + 24, file.contentBytes.length);
    writeUint16(view, offset + 28, file.nameBytes.length);
    writeUint16(view, offset + 30, 0);
    writeUint16(view, offset + 32, 0);
    writeUint16(view, offset + 34, 0);
    writeUint16(view, offset + 36, 0);
    writeUint32(view, offset + 38, 0);
    writeUint32(view, offset + 42, localOffsets[index]);
    offset += centralHeaderSize;

    zip.set(file.nameBytes, offset);
    offset += file.nameBytes.length;
  });

  writeUint32(view, offset, 0x06054b50);
  writeUint16(view, offset + 4, 0);
  writeUint16(view, offset + 6, 0);
  writeUint16(view, offset + 8, files.length);
  writeUint16(view, offset + 10, files.length);
  writeUint32(view, offset + 12, offset - centralDirectoryOffset);
  writeUint32(view, offset + 16, centralDirectoryOffset);
  writeUint16(view, offset + 20, 0);

  return zip;
};

export const createXlsxBytes = (sheets: XlsxSheet[]): Uint8Array => {
  const entries: ZipEntry[] = [
    { path: "[Content_Types].xml", content: toContentTypesXml(sheets) },
    { path: "_rels/.rels", content: ROOT_RELS_XML },
    { path: "xl/workbook.xml", content: toWorkbookXml(sheets) },
    { path: "xl/_rels/workbook.xml.rels", content: toWorkbookRelsXml(sheets) },
    ...sheets.map((sheet, index) => ({
      path: `xl/worksheets/sheet${index + 1}.xml`,
      content: toSheetXml(sheet)
    }))
  ];

  return createZip(entries);
};

export const downloadXlsx = (sheets: XlsxSheet[], fileName: string): void => {
  const workbook = new Blob([createXlsxBytes(sheets)], {
    type: XLSX_MIME_TYPE
  });
  const downloadUrl = URL.createObjectURL(workbook);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = `${fileName}.xlsx`;
  link.click();
  URL.revokeObjectURL(downloadUrl);
};
