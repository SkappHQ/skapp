import { useGetAttendanceConfiguration } from "~community/attendance/api/AttendanceAdminApi";
import { AttendanceConfigurationType } from "~community/attendance/types/attendanceTypes";
import useSessionData from "~community/common/hooks/useSessionData";

export interface ManualEntryRestrictionResult {
  isManualEntryRestricted: boolean;
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

  const isManualEntryRestricted =
    !canManageTimeEntries &&
    (isConfigUnavailable ||
      Boolean(attendanceConfig?.isManualTimeEntryRestrictionEnabled));

  return { isManualEntryRestricted };
};

export default useManualEntryRestriction;
