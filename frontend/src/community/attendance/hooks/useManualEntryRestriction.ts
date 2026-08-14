import { useGetAttendanceConfiguration } from "~community/attendance/api/AttendanceAdminApi";
import { AttendanceConfigurationType } from "~community/attendance/types/attendanceTypes";
import useSessionData from "~community/common/hooks/useSessionData";

export interface ManualEntryRestrictionResult {
  isManualEntryRestricted: boolean;
  isRestrictionEnabled: boolean;
  canDirectlyAddOrEditEntry: boolean;
}

const useManualEntryRestriction = (): ManualEntryRestrictionResult => {
  const { data, isPending, isError } = useGetAttendanceConfiguration();
  const { isSuperAdmin, isAttendanceAdmin, isAttendanceManager } =
    useSessionData();

  const attendanceConfig: AttendanceConfigurationType | undefined = data;

  const canManageTimeEntries = Boolean(
    isSuperAdmin || isAttendanceAdmin || isAttendanceManager
  );

  const isConfigUnavailable = isPending || isError;

  const isRestrictionEnabled = Boolean(
    attendanceConfig?.isManualTimeEntryRestrictionEnabled
  );

  const isManualEntryRestricted =
    !canManageTimeEntries && (isConfigUnavailable || isRestrictionEnabled);

  const canDirectlyAddOrEditEntry =
    !isConfigUnavailable && isRestrictionEnabled && canManageTimeEntries;

  return {
    isManualEntryRestricted,
    isRestrictionEnabled,
    canDirectlyAddOrEditEntry
  };
};

export default useManualEntryRestriction;
