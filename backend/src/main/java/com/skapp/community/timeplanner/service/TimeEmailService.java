package com.skapp.community.timeplanner.service;

import com.skapp.community.common.model.User;
import com.skapp.community.leaveplanner.model.LeaveRequest;
import com.skapp.community.timeplanner.model.TimeConfig;
import com.skapp.community.timeplanner.model.TimeRequest;

import java.util.List;

public interface TimeEmailService {

	void sendNonWorkingDaySingleDayPendingLeaveRequestCancelEmployeeEmail(LeaveRequest leaveRequest);

	void sendNonWorkingDaySingleDayPendingLeaveRequestCancelManagerEmail(LeaveRequest leaveRequest);

	void sendNonWorkingDayMultiDayPendingLeaveRequestCancelEmployeeEmail(LeaveRequest leaveRequest,
			List<TimeConfig> timeConfigs);

	void sendNonWorkingDayMultiDayPendingLeaveRequestCancelManagerEmail(LeaveRequest leaveRequest,
			List<TimeConfig> timeConfigs);

	void sendNonWorkingDaySingleDayApprovedLeaveRequestRevokedEmployeeEmail(LeaveRequest leaveRequest);

	void sendNonWorkingDaySingleDayApprovedLeaveRequestRevokedManagerEmail(LeaveRequest leaveRequest);

	void sendNonWorkingDayMultiDayApprovedLeaveRequestRevokedEmployeeEmail(LeaveRequest leaveRequest);

	void sendNonWorkingDayMultiDayApprovedLeaveRequestRevokedManagerEmail(LeaveRequest leaveRequest);

	void sendTimeEntryRequestSubmittedEmployeeEmail(TimeRequest timeRequest);

	void sendReceivedTimeEntryRequestManagerEmail(TimeRequest timeRequest);

	void sendTimeEntryRequestApprovedEmployeeEmail(TimeRequest timeRequestResponse, User managerUser);

	void sendTimeEntryRequestDeclinedEmployeeEmail(TimeRequest timeRequestResponse, User managerUser);

	void sendPendingTimeEntryRequestCancelledEmployeeEmail(TimeRequest timeRequest);

	void sendPendingTimeEntryRequestCancelledManagerEmail(TimeRequest timeRequest);

	void sendTimeEntryRequestAutoApprovedEmployeeEmail(TimeRequest timeRequestResponse);

	void sendTimeEntryRequestAutoApprovedManagerEmail(TimeRequest timeRequestResponse);

	void sendTimeEntryRequestApprovedOtherManagerEmail(TimeRequest timeRequest, User managerUser);

	void sendTimeEntryRequestDeclinedOtherManagerEmail(TimeRequest timeRequest, User managerUser);

}
