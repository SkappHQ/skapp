import { FC } from "react";

import BulkUploadSummary from "~community/common/components/molecules/BulkUploadSummary/BulkUploadSummary";
import { BulkUploadResponse } from "~community/common/types/BulkUploadTypes";
import { downloadBulkUploadErrorLogsCSV } from "~community/common/utils/bulkUploadUtils";
import { LeaveTypeType } from "~community/leave/types/AddLeaveTypes";

interface Props {
  leaveTypes: LeaveTypeType[];
  errorLog: BulkUploadResponse | null;
}

const LeaveEntitlementBulkUploadSummary: FC<Props> = ({
  leaveTypes,
  errorLog
}) => {
  return (
    <BulkUploadSummary
      successCount={errorLog?.bulkStatusSummary?.successCount ?? 0}
      failedCount={errorLog?.bulkStatusSummary?.failedCount ?? 0}
      onClick={() =>
        downloadBulkUploadErrorLogsCSV(
          errorLog as BulkUploadResponse,
          leaveTypes
        )
      }
    />
  );
};

export default LeaveEntitlementBulkUploadSummary;
