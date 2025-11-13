import { Box, Stack, Typography } from "@mui/material";

import CopyIcon from "~community/common/assets/Icons/CopyIcon";
import IconChip from "~community/common/components/atoms/Chips/IconChip.tsx/IconChip";
import { FileTypes } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useDownloadAttachment } from "~community/leave/hooks/useDownloadAttachment";
import { AttachmentType } from "~community/leave/types/EmployeeLeaveRequestTypes";
import { getFileNameOfAttachmentFromUrl } from "~community/leave/utils/getFileNameofAttachedFiles/getFileNamesofAttachments";

interface Props {
  attachments?: AttachmentType[];
}

const AttachmentRow = ({ attachments }: Props) => {
  const translateText = useTranslator("leaveModule", "myRequests");
  const translateAria = useTranslator(
    "leaveAria",
    "myRequests",
    "myLeaveRequests"
  );
  const { handleDownloadAttachment } = useDownloadAttachment({
    fileType: FileTypes.LEAVE_ATTACHMENTS
  });

  const getDisplayFileName = (url: string) => {
    const fileName = getFileNameOfAttachmentFromUrl(url);
    return fileName === "unknown-file"
      ? translateText(["myLeaveRequests", "uploadedAttachment"]) // or whatever translation key you want
      : fileName;
  };

  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <Stack
      sx={{
        gap: 1
      }}
      tabIndex={0}
    >
      <Typography variant="body2" sx={{ fontSize: "1rem" }}>
        {translateText(["myLeaveRequests", "attachments"])}
      </Typography>
      <Box sx={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {attachments.map((attachment, index) => (
          <IconChip
            key={index}
            label={getDisplayFileName(attachment.url)}
            chipStyles={{
              backgroundColor: "grey.100",
              py: "0.75rem",
              px: "0.75rem",
              maxWidth: "7.828rem"
            }}
            icon={<CopyIcon />}
            onClick={() => handleDownloadAttachment(attachment.url)}
            accessibility={{
              ariaLabel: `${translateAria(["downloadAttachment"])} ${index + 1}`
            }}
          />
        ))}
      </Box>
    </Stack>
  );
};

export default AttachmentRow;
