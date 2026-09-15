import { useMemo } from "react";

import { useGetAttendanceConfiguration } from "~community/attendance/api/AttendanceAdminApi";
import { AttendanceConfigurationType } from "~community/attendance/types/attendanceTypes";
import { DirectEntryEmployeeType } from "~community/attendance/types/timeSheetTypes";
import useSessionData from "~community/common/hooks/useSessionData";
import { concatStrings } from "~community/common/utils/commonUtil";
import useTier from "~enterprise/common/hooks/useTier";

export interface ManualEntryRestrictionResult {
  isManualEntryRestricted: boolean;
  isRestrictionEnabled: boolean;
  canDirectlyAddOrEditEntry: boolean;
  selfDirectEntryTarget: DirectEntryEmployeeType | null;
  isLoading: boolean;
  isError: boolean;
}

const useManualEntryRestriction = (): ManualEntryRestrictionResult => {
  const { data, isPending, isError } = useGetAttendanceConfiguration();
  const {
    isSuperAdmin,
    isAttendanceAdmin,
    isAttendanceManager,
    employeeDetails
  } = useSessionData();
  const { isAtLeastCoreTier } = useTier();

  const attendanceConfig: AttendanceConfigurationType | undefined = data;

  const canManageTimeEntries = Boolean(
    isSuperAdmin || isAttendanceAdmin || isAttendanceManager
  );

  const isRestrictionEnabled =
    isAtLeastCoreTier &&
    Boolean(attendanceConfig?.isManualTimeEntryRestrictionEnabled);

  const isManualEntryRestricted = !canManageTimeEntries && isRestrictionEnabled;

  const canDirectlyAddOrEditEntry =
    !isError && isRestrictionEnabled && canManageTimeEntries;

  const selfDirectEntryTarget = useMemo<DirectEntryEmployeeType | null>(() => {
    if (!canDirectlyAddOrEditEntry || !employeeDetails?.employeeId) {
      return null;
    }

    return {
      employeeId: employeeDetails.employeeId,
      employeeName: concatStrings([
        employeeDetails.firstName ?? "",
        employeeDetails.lastName ?? ""
      ]).trim(),
      isSelf: true
    };
  }, [canDirectlyAddOrEditEntry, employeeDetails]);

  return {
    isManualEntryRestricted,
    isRestrictionEnabled,
    canDirectlyAddOrEditEntry,
    selfDirectEntryTarget,
    isLoading: isPending,
    isError
  };
};

export default useManualEntryRestriction;
