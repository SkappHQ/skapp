import { SetStateAction } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { ToastProps } from "~community/common/types/ToastTypes";
import {
  formatDateToISOString,
  getYearStartAndEndDates
} from "~community/common/utils/dateTimeUtils";
import { LeaveEntitlementToastEnums } from "~community/leave/enums/LeaveEntitlementEnums";
import { CustomLeaveAllocationType } from "~community/leave/types/CustomLeaveAllocationTypes";
import { GoogleAnalyticsTypes } from "~enterprise/common/types/GoogleAnalyticsTypes";

interface HandleLeaveEntitlementApiResponseProps {
  type: LeaveEntitlementToastEnums;
  setToastMessage: (value: SetStateAction<ToastProps>) => void;
  translateText: (key: string[], data?: Record<string, unknown>) => string;
  selectedYear?: string;
  noOfRecords?: number;
  isReupload?: boolean;
  sendEvent?: (event: GoogleAnalyticsTypes) => void;
}

export const handleLeaveEntitlementApiResponse = ({
  type,
  setToastMessage,
  translateText,
  selectedYear,
  noOfRecords,
  isReupload,
  sendEvent
}: HandleLeaveEntitlementApiResponseProps) => {
  switch (type) {
    case LeaveEntitlementToastEnums.BULK_UPLOAD_PARTIAL_SUCCESS:
      setToastMessage({
        open: true,
        toastType: ToastType.SUCCESS,
        title: translateText(["toastMessages.bulkUploadPartialSuccessTitle"], {
          selectedYear: selectedYear
        }),
        description: translateText(
          ["toastMessages.bulkUploadPartialSuccessDescription"],
          {
            noOfRecords: noOfRecords
          }
        )
      });
      if (isReupload) {
        sendEvent?.(GoogleAnalyticsTypes.GA4_LEAVE_BULK_RE_UPLOADED);
      } else {
        sendEvent?.(GoogleAnalyticsTypes.GA4_LEAVE_BULK_UPLOADED);
      }
      break;
    case LeaveEntitlementToastEnums.BULK_UPLOAD_COMPLETE_SUCCESS:
      setToastMessage({
        open: true,
        toastType: ToastType.SUCCESS,
        title: translateText(["toastMessages.bulkUploadCompleteSuccessTitle"]),
        description: translateText([
          "toastMessages.bulkUploadCompleteSuccessDescription"
        ])
      });
      if (isReupload) {
        sendEvent?.(GoogleAnalyticsTypes.GA4_LEAVE_BULK_RE_UPLOADED);
      } else {
        sendEvent?.(GoogleAnalyticsTypes.GA4_LEAVE_BULK_UPLOADED);
      }
      break;
    case LeaveEntitlementToastEnums.BULK_UPLOAD_ERROR:
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["toastMessages.bulkUploadErrorTitle"]),
        description: translateText(["toastMessages.bulkUploadErrorDescription"])
      });
      break;
    default:
      break;
  }
};

export const handleCustomLeaveEntitlementPayload = ({
  newEntitlementData,
  selectedYear
}: {
  newEntitlementData: CustomLeaveAllocationType;
  selectedYear: string;
}) => {
  let startDateOfYear: string | undefined;
  let endDateOfYear: string | undefined;

  if (selectedYear) {
    const { start, end } = getYearStartAndEndDates(Number(selectedYear));
    startDateOfYear = start ?? "";
    endDateOfYear = end ?? "";
  } else {
    const { end: endOfYearDate } = getYearStartAndEndDates(
      new Date().getFullYear()
    );
    endDateOfYear = endOfYearDate ?? "";
    startDateOfYear = formatDateToISOString(new Date());
  }

  if (!newEntitlementData.validFromDate) {
    newEntitlementData.validFromDate = startDateOfYear ?? undefined;
  }
  if (!newEntitlementData.validToDate) {
    newEntitlementData.validToDate = endDateOfYear ?? undefined;
  }

  const { name, ...EntitlementData } = newEntitlementData;

  return EntitlementData;
};
