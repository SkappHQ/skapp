import { Box, Typography } from "@mui/material";
import { FC } from "react";

import Button from "~community/common/components/atoms/Button/Button";
import Icon from "~community/common/components/atoms/Icon/Icon";
import { BulkSummaryFlows } from "~community/common/constants/stringConstants";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  BulkRecordErrorLogType,
  BulkUploadResponse
} from "~community/common/types/BulkUploadTypes";
import { IconName } from "~community/common/types/IconTypes";
import { holidayBulkUploadResponse } from "~community/people/types/HolidayTypes";
import { DirectoryModalTypes } from "~community/people/types/ModalTypes";
import {
  downloadHolidayBulkUploadErrorLogsCSV,
  downloadUserBulkUploadErrorLogsCSV
} from "~community/people/utils/holidayUtils/commonUtils";

interface Props {
  setPopupType: (value: DirectoryModalTypes) => void;
  data: holidayBulkUploadResponse | BulkUploadResponse;
  flow: BulkSummaryFlows;
}

const BulkUploadSummary: FC<Props> = ({ setPopupType, data, flow }) => {
  const translateText = useTranslator(
    "peopleModule",
    "peoples.bulkUploadSummaries"
  );

  const totalEntries =
    data?.bulkStatusSummary?.successCount +
    data?.bulkStatusSummary?.failedCount;

  const handleDownloadErrorLogCSV = () => {
    if (flow === BulkSummaryFlows.USER_BULK_UPLOAD) {
      downloadUserBulkUploadErrorLogsCSV(
        data.bulkRecordErrorLogs as unknown as BulkRecordErrorLogType[]
      );
    } else {
      downloadHolidayBulkUploadErrorLogsCSV(data as holidayBulkUploadResponse);
    }

    setPopupType(DirectoryModalTypes.NONE);
  };

  return (
    <Box>
      <Typography
        id="bulk-upload-summary-description"
        variant="body2"
        sx={{ my: 1 }}
      >
        {totalEntries === 1 && data?.bulkStatusSummary?.failedCount === 1
          ? translateText(["oneEntryOneFailSummary"])
          : totalEntries === data?.bulkStatusSummary?.failedCount
            ? translateText(["manyEntriesAllFailSummary"], {
                totalEntries
              })
            : ""}
        {data?.bulkStatusSummary?.successCount === 1
          ? translateText(["oneEntrySuccessSummary"])
          : data?.bulkStatusSummary?.successCount > 1
            ? translateText(["manyEntrySuccessSummary"], {
                successCount: data?.bulkStatusSummary?.successCount
              })
            : ""}
        {totalEntries !== 1 && data?.bulkStatusSummary?.failedCount === 1
          ? translateText(["oneEntryFailSummery"])
          : totalEntries !== data?.bulkStatusSummary?.failedCount &&
              data?.bulkStatusSummary?.failedCount > 1
            ? translateText(["manyEntryFailSummary"], {
                failCount: data?.bulkStatusSummary?.failedCount
              })
            : ""}
        {translateText(["commonUploadSummary"])}
      </Typography>
      <Button
        label={translateText(["addBulkUploadSummaryButton"])}
        endIcon={<Icon name={IconName.DOWNLOAD_ICON} />}
        buttonStyle={ButtonStyle.PRIMARY}
        styles={{ mt: "1rem" }}
        onClick={handleDownloadErrorLogCSV}
      />
    </Box>
  );
};

export default BulkUploadSummary;
