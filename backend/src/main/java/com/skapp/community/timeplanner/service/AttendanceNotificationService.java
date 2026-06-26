package com.skapp.community.timeplanner.service;

import com.skapp.community.common.model.User;
import com.skapp.community.leaveplanner.model.LeaveRequest;
import com.skapp.community.timeplanner.model.TimeConfig;
import com.skapp.community.timeplanner.model.TimeRequest;

import java.util.List;

public interface AttendanceNotificationService {

	void sendTimeEntryRequestSubmittedEmployeeNotification(TimeRequest timeRequest);

	void sendReceivedTimeEntryRequestManagerNotification(TimeRequest timeRequest);

	void sendTimeEntryRequestApprovedEmployeeNotification(TimeRequest timeRequest, User user);

	void sendTimeEntryRequestDeclinedByManagerEmployeeNotification(TimeRequest timeRequest, User user);

	void sendPendingTimeEntryRequestCancelledEmployeeNotification(TimeRequest timeRequest);

	void sendPendingTimeEntryRequestCancelledManagerNotification(TimeRequest timeRequest);

	void sendTimeEntryRequestAutoApprovedEmployeeNotification(TimeRequest timeRequest);

	void sendTimeEntryRequestAutoApprovedManagerNotification(TimeRequest timeRequest);

	void sendNonWorkingDaySingleDayPendingLeaveRequestCancelEmployeeNotification(LeaveRequest leaveRequest);

	void sendNonWorkingDayMultiDayPendingLeaveRequestCancelEmployeeNotification(LeaveRequest leaveRequest);

	void sendNonWorkingDaySingleLeaveRequestRevokedEmployeeNotification(LeaveRequest leaveRequest);

	void sendNonWorkingDayMultiDayApprovedLeaveRequestRevokedEmployeeNotification(LeaveRequest leaveRequest);

	void sendNonWorkingDaySingleDayPendingLeaveRequestCancelManagerNotification(LeaveRequest leaveRequest);

	void sendNonWorkingDayMultiDayPendingLeaveRequestCancelManagerNotification(LeaveRequest leaveRequest,
			List<TimeConfig> removingConfigs);

	void sendNonWorkingDaySingleDayApprovedLeaveRequestRevokedManagerNotification(LeaveRequest leaveRequest);

	void sendNonWorkingDayMultiDayApprovedLeaveRequestRevokedManagerNotification(LeaveRequest leaveRequest);

	void sendTimeEntryRequestApprovedOtherManagerNotification(TimeRequest timeRequest, User user);

	void sendTimeEntryRequestDeclinedOtherManagerNotification(TimeRequest timeRequest, User user);

}
