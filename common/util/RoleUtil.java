package com.skapp.enterprise.common.util;

import com.skapp.community.common.type.Role;
import lombok.experimental.UtilityClass;

@UtilityClass
public class RoleUtil {

	public boolean isLeaveManagerOrAdmin(Role leaveRole) {
		return leaveRole == Role.LEAVE_MANAGER || leaveRole == Role.LEAVE_ADMIN || leaveRole == Role.SUPER_ADMIN;
	}

	public boolean isAttendanceManagerOrAdmin(Role attendanceRole) {
		return attendanceRole == Role.ATTENDANCE_MANAGER || attendanceRole == Role.ATTENDANCE_ADMIN
				|| attendanceRole == Role.SUPER_ADMIN;
	}

	public boolean isEsignSenderAdminOrSuperAdmin(Role esignRole) {
		return esignRole == Role.ESIGN_SENDER || esignRole == Role.ESIGN_ADMIN || esignRole == Role.SUPER_ADMIN;
	}

}
