export const getFileNameOfAttachmentFromUrl = (
  url: string
): string | undefined => {
  if (!url) {
    return undefined;
  }

  const splittedURL = url.split("?")[0].split("#")[0];
  const fileName = splittedURL.split("/").pop() || undefined;

  return fileName ? decodeURIComponent(fileName) : undefined;
};
