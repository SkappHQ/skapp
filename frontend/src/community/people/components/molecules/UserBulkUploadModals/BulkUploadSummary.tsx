import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { BulkSummaryFlows } from "~community/common/constants/stringConstants";
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
    <div>
      <p
        id="bulk-upload-summary-description"
        className="text-sm my-2"
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
      </p>
      <div className="flex justify-end  my-2">
        <ButtonV2
          variant={"primary"}
          onClick={handleDownloadErrorLogCSV}
          icon={<Icon name={IconName.DOWNLOAD_ICON} />}
          iconPosition="end"
        >
          {translateText(["addBulkUploadSummaryButton"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default BulkUploadSummary;
