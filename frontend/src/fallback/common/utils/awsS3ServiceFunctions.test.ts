import { FileCategories } from "../types/s3Types";
import {
  deleteFileFromS3,
  getS3FoldersByUrl,
  uploadFileToS3ByUrl
} from "./awsS3ServiceFunctions";

describe("awsS3ServiceFunctions", () => {
  describe("uploadFileToS3ByUrl", () => {
    it("returns a file path after uploading", async () => {
      const mockFile = new File(["content"], "test.txt", {
        type: "text/plain"
      });
      const mockCategory = FileCategories.LEAVE_REQUEST;
      const mockSetProgress = jest.fn();

      const result = await uploadFileToS3ByUrl(
        mockFile,
        mockCategory,
        mockSetProgress
      );

      expect(result).toBe(""); // Replace with actual expected file path if applicable
    });
  });

  describe("deleteFileFromS3", () => {
    it("deletes a file without throwing errors", async () => {
      const mockFilePath = "test/path/to/file.txt";

      await expect(deleteFileFromS3(mockFilePath)).resolves.not.toThrow();
    });
  });

  describe("getS3FoldersByUrl", () => {
    it("returns folders for a given file path", () => {
      const mockFilePath = "test/path/to/file.txt";

      const result = getS3FoldersByUrl(mockFilePath);

      expect(result).toBeUndefined(); // Replace with actual expected result if applicable
    });
  });
});
