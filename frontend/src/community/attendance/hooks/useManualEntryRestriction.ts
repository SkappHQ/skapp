import { useGetAttendanceConfiguration } from "~community/attendance/api/AttendanceAdminApi";
import { AttendanceConfigurationType } from "~community/attendance/types/attendanceTypes";
import useSessionData from "~community/common/hooks/useSessionData";
import useTier from "~enterprise/common/hooks/useTier";

export interface ManualEntryRestrictionResult {
  isManualEntryRestricted: boolean;
  isRestrictionEnabled: boolean;
  canDirectlyAddOrEditEntry: boolean;
  isLoading: boolean;
  isError: boolean;
}

const useManualEntryRestriction = (): ManualEntryRestrictionResult => {
  const { data, isPending, isError } = useGetAttendanceConfiguration();
  const { isSuperAdmin, isAttendanceAdmin, isAttendanceManager } =
    useSessionData();
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

  return {
    isManualEntryRestricted,
    isRestrictionEnabled,
    canDirectlyAddOrEditEntry,
    isLoading: isPending,
    isError
  };
};

export default useManualEntryRestriction;
