import { Box, Typography } from "@mui/material";
import { FC } from "react";

import Button from "~community/common/components/atoms/Button/Button";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { usePeopleStore } from "~community/people/store/store";
import {
  holidayBulkUploadResponse,
  holidayModalTypes
} from "~community/people/types/HolidayTypes";
import { downloadHolidayBulkUploadErrorLogsCSV } from "~community/people/utils/holidayUtils/commonUtils";

interface Props {
  setPopupType?: (value: holidayBulkUploadResponse) => void;
  data: holidayBulkUploadResponse | undefined;
}

const BulkUploadSummary: FC<Props> = ({ data }) => {
  const translateText = useTranslator("peopleModule", "holidays");
  const { setHolidayModalType, setIsHolidayModalOpen, resetFailedCount } =
    usePeopleStore((state) => state);
  const totalEntries =
    data &&
    data?.bulkStatusSummary?.successCount +
      data?.bulkStatusSummary?.failedCount;

  const handleDownloadErrorLogCSV = () => {
    downloadHolidayBulkUploadErrorLogsCSV(data as holidayBulkUploadResponse);
    setHolidayModalType(holidayModalTypes.NONE);
    setIsHolidayModalOpen(false);
    resetFailedCount();
  };

  return (
    <Box>
      <Typography
        id="status-summary-description"
        variant="body1"
        sx={{ my: 1 }}
      >
        {totalEntries &&
        data?.bulkStatusSummary?.failedCount <= 1 &&
        data?.bulkStatusSummary?.successCount <= 1
          ? translateText(["BulkUploadSuccessNFailDes"], {
              successCount: data?.bulkStatusSummary?.successCount,
              failedCount: data?.bulkStatusSummary?.failedCount
            })
          : totalEntries && data?.bulkStatusSummary?.failedCount >= 1
            ? translateText(["BulkUploadFailDes"], {
                failedCount: data?.bulkStatusSummary?.failedCount
              })
            : ""}
      </Typography>
      <Button
        label={translateText(["addBulkUploadSummaryButton"])}
        endIcon={IconName.DOWNLOAD_ICON}
        buttonStyle={ButtonStyle.PRIMARY}
        styles={{ mt: "1rem" }}
        onClick={handleDownloadErrorLogCSV}
        accessibility={{
          ariaDescribedBy: "status-summary-description"
        }}
      />
    </Box>
  );
};

export default BulkUploadSummary;
