import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
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
    <div>
      <p
        id="status-summary-description"
        className="my-2"
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
      </p>
      <div className="flex flex-row justify-end gap-3 mt-4">
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
