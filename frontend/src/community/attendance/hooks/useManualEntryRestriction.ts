import { useGetAttendanceConfiguration } from "~community/attendance/api/AttendanceAdminApi";
import { AttendanceConfigurationType } from "~community/attendance/types/attendanceTypes";
import useSessionData from "~community/common/hooks/useSessionData";

const useManualEntryRestriction = () => {
  const { data, isPending } = useGetAttendanceConfiguration();
  const { isSuperAdmin, isAttendanceAdmin, isAttendanceManager } =
    useSessionData();

  const attendanceConfig: AttendanceConfigurationType | undefined = data;

  const canManageTimeEntries = Boolean(
    isSuperAdmin || isAttendanceAdmin || isAttendanceManager
  );

  const isManualEntryRestricted =
    !canManageTimeEntries &&
    (isPending || Boolean(attendanceConfig?.isManualTimeEntryEnabled));

  return { isManualEntryRestricted };
};

export default useManualEntryRestriction;
