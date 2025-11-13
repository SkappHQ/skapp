export const getFileNameOfAttachmentFromUrl = (url: string): string => {
  if (!url || typeof url !== "string") {
    return "unknown-file";
  }
  try {
    const urlWithoutQuery = url.split("?")[0].split("#")[0];
    const fileName = urlWithoutQuery.split("/").pop() || urlWithoutQuery;
    return fileName ? decodeURIComponent(fileName) : "unknown-file";
  } catch (error) {
    const urlWithoutQuery = url.split("?")[0].split("#")[0];
    return urlWithoutQuery.split("/").pop() || "unknown-file";
  }
};
