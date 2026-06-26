import { UseMutateFunction } from "@tanstack/react-query";
import { Dispatch, SetStateAction } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { ToastProps } from "~community/common/types/ToastTypes";
import { processEntitlementPayload } from "~community/common/utils/leaveUtils";
import {
  EntitlementYears,
  leaveBulkUploadResponse
} from "~community/leave/types/LeaveTypes";
import { EntitlementInfo } from "~community/people/types/EmployeeBulkUpload";
import {
  EntitlementDetailType,
  L3EmploymentDetailsType,
  L3GeneralDetailsType
} from "~community/people/types/PeopleTypes";

interface HandleSaveEntitlementsProps {
  isSuccess: boolean;
  employeeGeneralDetails: L3GeneralDetailsType;
  employeeEmploymentDetails: L3EmploymentDetailsType;
  entitlementDetails: EntitlementDetailType[];
  currentYearMutation: UseMutateFunction<
    leaveBulkUploadResponse,
    Error,
    EntitlementInfo,
    unknown
  >;
  currentYearSuccessFlag: boolean;
  setCurrentYearSuccessFlag: Dispatch<SetStateAction<boolean>>;
  nextYearMutation: UseMutateFunction<
    leaveBulkUploadResponse,
    Error,
    EntitlementInfo,
    unknown
  >;
  nextYearSuccessFlag: boolean;
  setNextYearSuccessFlag: Dispatch<SetStateAction<boolean>>;
}

export const handleSaveEntitlements = ({
  isSuccess,
  employeeGeneralDetails,
  employeeEmploymentDetails,
  entitlementDetails,
  currentYearMutation,
  currentYearSuccessFlag,
  setCurrentYearSuccessFlag,
  nextYearMutation,
  nextYearSuccessFlag,
  setNextYearSuccessFlag
}: HandleSaveEntitlementsProps) => {
  if (!isSuccess) {
    return;
  }

  const currentYearPayload = processEntitlementPayload({
    requiredYear: EntitlementYears.CURRENT,
    employeeName: employeeGeneralDetails?.firstName ?? "",
    email: employeeEmploymentDetails?.email ?? "",
    employeeEntitlementsDetails: entitlementDetails
  });

  const nextYearPayload = processEntitlementPayload({
    requiredYear: EntitlementYears.NEXT,
    employeeName: employeeGeneralDetails?.firstName ?? "",
    email: employeeEmploymentDetails?.email ?? "",
    employeeEntitlementsDetails: entitlementDetails
  });

  !currentYearPayload?.entitlementDetailsList?.[0]?.entitlements?.length &&
    setCurrentYearSuccessFlag(true);

  !currentYearSuccessFlag &&
    currentYearPayload?.entitlementDetailsList?.[0]?.entitlements?.length &&
    currentYearMutation(currentYearPayload);

  !nextYearPayload?.entitlementDetailsList?.[0]?.entitlements?.length &&
    setNextYearSuccessFlag(true);

  !nextYearSuccessFlag &&
    nextYearPayload?.entitlementDetailsList?.[0]?.entitlements?.length &&
    nextYearMutation(nextYearPayload);
};

interface HandleBulkUploadResponseProps {
  responseData: leaveBulkUploadResponse;
  setSuccessFlag: (value: boolean) => void;
  translateText: (keys: string[]) => string;
  setToastMessage: Dispatch<SetStateAction<ToastProps>>;
}

export const handleBulkUploadResponse = ({
  responseData,
  setSuccessFlag,
  translateText,
  setToastMessage
}: HandleBulkUploadResponseProps) => {
  if (responseData?.bulkStatusSummary?.failedCount === 0) {
    setSuccessFlag(true);
  } else {
    setToastMessage({
      toastType: ToastType.ERROR,
      title: translateText(["entitlementErrorMessage"]),
      description: responseData?.bulkRecordErrorLogs[0]?.message,
      open: true
    });
  }
};
