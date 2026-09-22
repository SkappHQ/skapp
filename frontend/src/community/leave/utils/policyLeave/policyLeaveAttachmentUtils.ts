import { appModes } from "~community/common/constants/configs";
import { FileTypes } from "~community/common/enums/CommonEnums";
import { FileUploadType } from "~community/common/types/CommonTypes";
import { ATTACHMENT_UPLOAD_FAILED } from "~community/leave/constants/stringConstants";
import { PolicyLeaveAttachmentPayload } from "~community/leave/types/PolicyLeaveTypes";
import { FileCategories } from "~enterprise/common/types/s3Types";
import { uploadFileToS3ByUrl } from "~enterprise/common/utils/awsS3ServiceFunctions";

type UploadImagesFn = (formData: FormData) => Promise<{ message?: string }>;

const UPLOADED_FILE_NAME_PATTERN = /\/([^/\s]+)$/;

interface UploadPolicyLeaveAttachmentsProps {
  attachments: FileUploadType[];
  environment: string | undefined;
  uploadAttachments: UploadImagesFn;
}

const uploadToCommunity = async (
  file: File,
  uploadAttachments: UploadImagesFn
): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", FileTypes.LEAVE_ATTACHMENTS);

  const response = await uploadAttachments(formData);
  const fileUrl = response.message?.match(UPLOADED_FILE_NAME_PATTERN)?.[1];

  if (!fileUrl) {
    throw new Error(ATTACHMENT_UPLOAD_FAILED);
  }

  return fileUrl;
};

const uploadToS3 = async (file: File): Promise<string> => {
  const fileUrl = await uploadFileToS3ByUrl(file, FileCategories.LEAVE_REQUEST);

  if (!fileUrl) {
    throw new Error(ATTACHMENT_UPLOAD_FAILED);
  }

  return fileUrl;
};

export const uploadPolicyLeaveAttachments = async ({
  attachments,
  environment,
  uploadAttachments
}: UploadPolicyLeaveAttachmentsProps): Promise<
  PolicyLeaveAttachmentPayload[]
> => {
  if (attachments.length === 0) {
    return [];
  }

  const uploadOne = async (
    attachment: FileUploadType
  ): Promise<PolicyLeaveAttachmentPayload> => {
    if (!attachment.file) {
      throw new Error(ATTACHMENT_UPLOAD_FAILED);
    }

    const file = attachment.file as File;

    const fileUrl =
      environment === appModes.COMMUNITY
        ? await uploadToCommunity(file, uploadAttachments)
        : await uploadToS3(file);

    return { fileUrl, originalFileName: attachment.name };
  };

  return Promise.all(attachments.map(uploadOne));
};
