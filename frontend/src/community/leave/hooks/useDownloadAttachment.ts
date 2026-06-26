import { useEffect, useState } from "react";

import { useGetUploadedLeaveAttachments } from "~community/common/api/FileHandleApi";
import { appModes } from "~community/common/constants/configs";
import { FileTypes } from "~community/common/enums/CommonEnums";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";
import useS3Download from "~enterprise/common/hooks/useS3Download";

export const useDownloadAttachment = ({
  fileType
}: {
  fileType: FileTypes;
}) => {
  const [attachment, setAttachment] = useState<string | null>(null);
  const [currentAttachmentFormat, setCurrentAttachmentFormat] = useState<
    string | null
  >(null);

  const { data: leaveAttachment, refetch } = useGetUploadedLeaveAttachments(
    fileType,
    attachment,
    false
  );

  const environment = useGetEnvironment();

  const { s3FileUrls, downloadS3File } = useS3Download();

  const downloadFileToDevice = (fileContent: Blob, fileName: string): void => {
    try {
      const url = window.URL.createObjectURL(fileContent);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setAttachment(null);
    } catch (error) {
      console.error("Error downloading file to device:", error);
    }
  };

  const downloadFileFromS3 = async (url: string): Promise<void> => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      const blob = await response.blob();
      const fileName = url.split("?")[0].split("/").pop() || "Attachment";
      downloadFileToDevice(blob, fileName);
    } catch (error) {
      console.error("Error downloading file from S3:", error);
    }
  };

  const handleDownloadAttachment = (url: string): void => {
    setAttachment(url);
    setCurrentAttachmentFormat(url.split(".").pop() || null);
  };

  useEffect(() => {
    if (attachment) {
      if (environment === appModes.COMMUNITY) {
        refetch();
      } else if (environment === appModes.ENTERPRISE) {
        downloadS3File({ filePath: attachment });
      }
    }
  }, [attachment, environment, refetch, downloadS3File]);

  useEffect(() => {
    if (environment === appModes.COMMUNITY && leaveAttachment) {
      downloadFileToDevice(
        leaveAttachment,
        `attachment.${attachment?.split(".").pop()}`
      );
    }
    setAttachment(null);
  }, [leaveAttachment, environment]);

  useEffect(() => {
    if (environment === appModes.ENTERPRISE && attachment) {
      downloadFileFromS3(s3FileUrls[attachment]);
    }
  }, [s3FileUrls, environment, attachment]);

  return {
    attachment,
    currentAttachmentFormat,
    setAttachment,
    handleDownloadAttachment
  };
};
