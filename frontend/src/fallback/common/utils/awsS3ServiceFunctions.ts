import { FileCategories } from "../types/s3Types";

export const uploadFileToS3ByUrl = async (
  _file: File,
  _fileCategory: FileCategories,
  _setFileUploadProgress?: (value: number) => void,
  _pairedFilePath?: string
) => {
  const filePath = "";
  return filePath;
};

export const deleteFileFromS3 = async (_filePath: string) => {};

export const getS3FoldersByUrl = (_filePath: string) => {};
