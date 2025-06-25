import { Stack, Typography } from "@mui/material";
import { FC } from "react";

import Button from "~community/common/components/atoms/Button/Button";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
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
      <Button
        label={translateText(["btn"])}
        endIcon={IconName.DOWNLOAD_ICON}
        buttonStyle={ButtonStyle.PRIMARY}
        styles={{ mt: "1rem" }}
        onClick={onClick}
        accessibility={{
          ariaHidden: true
        }}
      />
    </Stack>
  );
};

export default BulkUploadSummary;
