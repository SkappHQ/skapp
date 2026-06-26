import { BulkUploadResponse } from "~community/common/types/BulkUploadTypes";

export const createCSV = (
  stream: ReadableStream<Uint8Array>,
  fileName: string
) => {
  const encoder = new TextEncoder();
  const streamReader = stream.getReader();
  const csvDataChunks: Uint8Array[] = [];

  const processStream = (): Promise<void> => {
    return streamReader.read().then(({ done, value }) => {
      if (done) {
        const csvContent = csvDataChunks.join("");
        const encodedCsvContent = encoder.encode(csvContent);
        const blob = new Blob([encodedCsvContent], { type: "text/csv" });
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `${fileName}.csv`;
        link.click();
      } else {
        csvDataChunks.push(value);
        return processStream();
      }
    });
  };

  void processStream();
};

export const downloadBulkUploadErrorLogsCSV = (
  data: BulkUploadResponse,
  leaveTypes: any[]
) => {
  const headers = [
    "Employee Id",
    "Employee Name",
    "Email",
    ...(leaveTypes || []).map((type) => type?.name),
    "Message"
  ];

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(headers.join(",") + "\n");

      for (const item of data?.bulkRecordErrorLogs || []) {
        const { employeeId, employeeName, email, message, entitlementsDto } =
          item;
        const entitlementValues = leaveTypes?.map((type) => {
          const entitlement = entitlementsDto?.find(
            (e) => e?.leaveTypeId === type?.typeId
          );
          return entitlement ? entitlement?.totalDaysAllocated : 0;
        });

        const row =
          [
            employeeId,
            `"${employeeName}"`,
            `"${email}"`,
            ...entitlementValues,
            `"${message}"`
          ].join(",") + "\n";

        controller.enqueue(row);
      }

      controller.close();
    }
  });

  createCSV(stream, "ErrorLog");
};
