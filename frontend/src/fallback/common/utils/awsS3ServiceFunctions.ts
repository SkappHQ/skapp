import { FileCategories } from "../types/s3Types";

export const uploadFileToS3ByUrl = async (
  file: File,
  fileCategory: FileCategories,
  setFileUploadProgress?: (value: number) => void
) => {
  const filePath = "";
  return filePath;
};

export const deleteFileFromS3 = async (filePath: string) => {};

export const getS3FoldersByUrl = (filePath: string) => {};
