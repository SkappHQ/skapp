import { Chip, Stack, Theme, useTheme } from "@mui/material";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { FileUploadType } from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import { downloadAttachmentToUserDevice } from "~community/common/utils/commonUtil";

import styles from "./styles";

interface Props {
  attachments: FileUploadType[];
  onDeleteBtnClick: (attachment: FileUploadType) => void;
}

const AttachmentSummary = ({ attachments, onDeleteBtnClick }: Props) => {
  const theme: Theme = useTheme();
  const classes = styles(theme);

  return (
    <Stack sx={classes.wrapper}>
      {attachments.map((attachment, index) => (
        <Chip
          icon={
            <Icon name={IconName.COPY_ICON} fill={theme.palette.grey[400]} />
          }
          key={index}
          label={attachment.name}
          onClick={() => downloadAttachmentToUserDevice(attachment)}
          onDelete={() => onDeleteBtnClick(attachment)}
          sx={classes.chip}
          deleteIcon={
            <Icon name={IconName.CLOSE_ICON} fill={theme.palette.grey[400]} />
          }
        />
      ))}
    </Stack>
  );
};

export default AttachmentSummary;
