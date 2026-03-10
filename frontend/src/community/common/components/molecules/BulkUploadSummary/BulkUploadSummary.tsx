import { Stack, Typography } from "@mui/material";
import { FC } from "react";

import { Button } from "@rootcodelabs/skapp-ui";
import Icon from "~community/common/components/atoms/Icon/Icon";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";

interface Props {
  successCount: number;
  failedCount: number;
  onClick: () => void;
}

const BulkUploadSummary: FC<Props> = ({
  successCount,
  failedCount,
  onClick
}) => {
  const translateText = useTranslator(
    "commonComponents",
    "userPromptModal",
    "bulkUploadSummaryModal"
  );

  return (
    <Stack>
      <Typography
        id="bulk-upload-summary-description"
        variant="body1"
        sx={{ my: 1 }}
      >
        {translateText(["description"], {
          successCount: successCount,
          failedCount: failedCount
        })}
      </Typography>
      <Button variant={"primary"} onClick={onClick} icon={<Icon name={IconName.DOWNLOAD_ICON} />} iconPosition="end">{translateText(["btn"])}</Button>
    </Stack>
  );
};

export default BulkUploadSummary;
