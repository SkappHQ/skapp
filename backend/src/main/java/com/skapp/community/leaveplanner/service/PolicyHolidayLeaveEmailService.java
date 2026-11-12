package com.skapp.community.leaveplanner.service;

import com.skapp.community.leaveplanner.model.PolicyLeaveRequest;
import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import com.skapp.community.peopleplanner.model.Holiday;

public interface PolicyHolidayLeaveEmailService {

	void sendHolidayLeaveRequestVoidedEmails(PolicyLeaveRequest policyLeaveRequest, Holiday holiday,
			LeaveRequestStatus originalStatus);

	void sendHolidayLeaveRequestUpdatedEmails(PolicyLeaveRequest policyLeaveRequest, Holiday holiday);

}
