package com.skapp.community.peopleplanner.service;

import com.skapp.community.common.model.User;
import com.skapp.community.leaveplanner.model.LeaveRequest;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.Holiday;

import java.util.List;

public interface PeopleNotificationService {

	void sendNewHolidayDeclarationNotification(Holiday holiday, List<Employee> employees);

	void sendHolidaySingleDayPendingLeaveRequestCancellationEmployeeNotification(LeaveRequest leaveRequest,
			Holiday holiday);

	void sendHolidayMultipleDayPendingLeaveRequestUpdatedEmployeeNotification(LeaveRequest leaveRequest,
			Holiday holiday);

	void sendHolidaySingleDayApprovedLeaveRequestRevokedEmployeeNotification(LeaveRequest leaveRequest,
			Holiday holiday);

	void sendHolidayMultipleDayApprovedLeaveRequestUpdatedEmployeeNotification(LeaveRequest leaveRequest,
			Holiday holiday);

	void sendHolidaySingleDayPendingLeaveRequestCancellationManagerNotification(LeaveRequest leaveRequest,
			Holiday holiday);

	void sendHolidayMultipleDayPendingLeaveRequestUpdatedManagerNotification(LeaveRequest leaveRequest,
			Holiday holiday);

	void sendHolidaySingleDayApprovedLeaveRequestRevokedManagerNotification(LeaveRequest leaveRequest, Holiday holiday);

	void sendHolidayMultipleDayApprovedLeaveRequestUpdatedManagerEmail(LeaveRequest leaveRequest, Holiday holiday);

	void sendPasswordResetRequestManagerNotification(User user, String requestDateTime);

}
