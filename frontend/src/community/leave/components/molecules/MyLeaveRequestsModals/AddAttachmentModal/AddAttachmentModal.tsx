import { Divider, Stack, Theme, Typography, useTheme } from "@mui/material";
import { useState } from "react";

import { Button } from "@rootcodelabs/skapp-ui";
import Icon from "~community/common/components/atoms/Icon/Icon";
import DragAndDropField from "~community/common/components/molecules/DragAndDropField/DragAndDropField";

import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  FileRejectionType,
  FileUploadType
} from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import { MAX_ALLOWED_UPLOADS } from "~community/leave/constants/stringConstants";
import { MyRequestModalEnums } from "~community/leave/enums/MyRequestEnums";
import { useLeaveStore } from "~community/leave/store/store";

const AddAttachmentModal = () => {
  const theme: Theme = useTheme();

  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "addAttachmentModal"
  );

  const { attachments, setAttachments, setMyLeaveRequestModalType } =
    useLeaveStore();

  const [attachmentError, setAttachmentError] = useState(false);

  const onCancelBtnClick = () => {
    setAttachments([]);
    setMyLeaveRequestModalType(MyRequestModalEnums.APPLY_LEAVE);
  };

  return (
    <Stack sx={{ gap: "0.75rem" }}>
      <Typography
        variant="body1"
        sx={{
          color: attachmentError
            ? theme.palette.error.contrastText
            : theme.palette.text.primary
        }}
      >
        {translateText(["description"])}
      </Typography>
      <DragAndDropField
        setAttachmentErrors={(errors: FileRejectionType[]) =>
          setAttachmentError(!!errors.length)
        }
        setAttachments={(attachments: FileUploadType[]) =>
          setAttachments(attachments)
        }
        accept={{
          "image/jpeg": [".jpg", ".jpeg"],
          "image/png": [],
          "application/pdf": [".pdf"]
        }}
        uploadableFiles={attachments}
        maxFileSize={MAX_ALLOWED_UPLOADS}
        supportedFiles={".jpg, .pdf, .png, .jpeg"}
      />
      <Divider />
      <Button variant={"primary"} onClick={() =>
          setMyLeaveRequestModalType(MyRequestModalEnums.APPLY_LEAVE)
        } disabled={attachmentError} icon={<Icon name={IconName.TICK_ICON} />} iconPosition="end">{translateText(["uploadBtn"])}</Button>
      <Button variant={"tertiary"} onClick={onCancelBtnClick} icon={<Icon name={IconName.CLOSE_ICON} />} iconPosition="end">{translateText(["cancelBtn"])}</Button>
    </Stack>
  );
};

export default AddAttachmentModal;
