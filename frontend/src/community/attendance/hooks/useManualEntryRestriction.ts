import { useGetAttendanceConfiguration } from "~community/attendance/api/AttendanceAdminApi";
import useSessionData from "~community/common/hooks/useSessionData";

/**
 * Resolves whether the signed in user is blocked from adding or editing time entries
 * by the organization level "Restrict Manual Time Entries & Edits" setting. Attendance
 * Managers, Attendance Admins and Super Admins keep their access while it is enabled.
 *
 * The setting is enforced server side as well, so this only drives what is rendered.
 */
const useManualEntryRestriction = () => {
  const { data: attendanceConfig } = useGetAttendanceConfiguration();
  const { isSuperAdmin, isAttendanceAdmin, isAttendanceManager } =
    useSessionData();

  const canManageTimeEntries = Boolean(
    isSuperAdmin || isAttendanceAdmin || isAttendanceManager
  );

  const isManualEntryRestricted =
    Boolean(attendanceConfig?.isManualEntryRestrictionEnabled) &&
    !canManageTimeEntries;

  return { isManualEntryRestricted };
};

export default useManualEntryRestriction;
