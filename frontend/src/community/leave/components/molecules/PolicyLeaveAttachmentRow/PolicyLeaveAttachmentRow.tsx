import { FC } from "react";

import CopyIcon from "~community/common/assets/Icons/CopyIcon";
import IconChip from "~community/common/components/atoms/Chips/IconChip.tsx/IconChip";
import { FileTypes } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { POLICY_LEAVE_ATTACHMENT_CHIP_STYLES } from "~community/leave/constants/policyLeaveReviewConstants";
import { useDownloadAttachment } from "~community/leave/hooks/useDownloadAttachment";
import { PolicyLeaveAttachmentType } from "~community/leave/types/PolicyLeaveTypes";
import { getFileNameOfAttachmentFromUrl } from "~community/leave/utils/getFileNameofAttachedFiles/getFileNamesofAttachments";

interface Props {
  attachments?: PolicyLeaveAttachmentType[];
}

const PolicyLeaveAttachmentRow: FC<Props> = ({ attachments }) => {
  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "myLeaveRequests"
  );
  const translateAria = useTranslator(
    "leaveAria",
    "myRequests",
    "myLeaveRequests"
  );

  const { handleDownloadAttachment } = useDownloadAttachment({
    fileType: FileTypes.LEAVE_ATTACHMENTS
  });

  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2" tabIndex={0}>
      <p className="body1">{translateText(["attachments"])}</p>
      <div className="flex flex-wrap gap-2">
        {attachments.map((attachment, index) => (
          <IconChip
            key={attachment.id}
            label={
              attachment.originalFileName ||
              getFileNameOfAttachmentFromUrl(attachment.fileUrl) ||
              translateText(["uploadedAttachment"])
            }
            chipStyles={{
              ...POLICY_LEAVE_ATTACHMENT_CHIP_STYLES,
              maxWidth: "7.828rem"
            }}
            icon={<CopyIcon />}
            onClick={() => handleDownloadAttachment(attachment.fileUrl)}
            accessibility={{
              ariaLabel: `${translateAria(["downloadAttachment"])} ${index + 1}`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default PolicyLeaveAttachmentRow;
