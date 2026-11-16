package com.skapp.community.leaveplanner.util;

import com.skapp.community.common.type.EmailBodyTemplates;
import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import lombok.experimental.UtilityClass;

@UtilityClass
public class PolicyHolidayLeaveUtil {

	public static EmailBodyTemplates getEmployeeTemplate(boolean isVoided, LeaveRequestStatus originalStatus) {
		boolean isPending = originalStatus == LeaveRequestStatus.PENDING;
		if (isVoided) {
			return isPending
					? EmailBodyTemplates.PEOPLE_MODULE_HOLIDAY_SINGLE_DAY_PENDING_LEAVE_REQUEST_CANCELED_EMPLOYEE
					: EmailBodyTemplates.PEOPLE_MODULE_HOLIDAY_SINGLE_DAY_APPROVED_LEAVE_REQUEST_REVOKED_EMPLOYEE;
		}
		return isPending ? EmailBodyTemplates.PEOPLE_MODULE_HOLIDAY_MULTI_DAY_PENDING_LEAVE_REQUEST_UPDATED_EMPLOYEE
				: EmailBodyTemplates.PEOPLE_MODULE_HOLIDAY_MULTI_DAY_APPROVED_LEAVE_REQUEST_UPDATED_EMPLOYEE;
	}

	public static EmailBodyTemplates getManagerTemplate(boolean isVoided, LeaveRequestStatus originalStatus) {
		boolean isPending = originalStatus == LeaveRequestStatus.PENDING;
		if (isVoided) {
			return isPending
					? EmailBodyTemplates.PEOPLE_MODULE_HOLIDAY_SINGLE_DAY_PENDING_LEAVE_REQUEST_CANCELED_MANAGER
					: EmailBodyTemplates.PEOPLE_MODULE_HOLIDAY_DAY_SINGLE_DAY_APPROVED_LEAVE_REQUEST_REVOKED_MANAGER;
		}
		return isPending ? EmailBodyTemplates.PEOPLE_MODULE_HOLIDAY_DAY_MULTI_DAY_PENDING_LEAVE_REQUEST_UPDATED_MANAGER
				: EmailBodyTemplates.PEOPLE_MODULE_HOLIDAY_MULTI_DAY_APPROVED_LEAVE_REQUEST_UPDATED_MANAGER;
	}

}
