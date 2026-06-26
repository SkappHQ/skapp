package com.skapp.community.leaveplanner.service;

import com.skapp.community.leaveplanner.model.LeaveEntitlement;
import com.skapp.community.leaveplanner.model.LeaveRequest;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeManager;

import java.time.LocalDate;
import java.util.List;

public interface LeaveNotificationService {

	void sendApplyLeaveRequestEmployeeNotification(Employee employee, Long leaveRequestId, String leaveDuration,
			String leaveType, LocalDate leaveStartDate, LocalDate leaveEndDate, boolean isSingleDay);

	void sendReceivedLeaveRequestManagerNotification(List<EmployeeManager> employeeManagers, String firstName,
			String lastName, Long leaveRequestId, String leaveDuration, String leaveTypeName, LocalDate leaveStartDate,
			LocalDate leaveEndDate, boolean isSingleDay);

	void sendCancelLeaveRequestEmployeeNotification(Employee employee, List<EmployeeManager> employeeManagers,
			LeaveRequest leaveRequest, boolean isSingleDay);

	void sendCancelLeaveRequestManagerNotification(Employee employee, List<EmployeeManager> employeeManagers,
			LeaveRequest leaveRequest, boolean isSingleDay);

	void sendApprovedSingleDayLeaveRequestEmployeeNotification(LeaveRequest leaveRequest);

	void sendApprovedMultiDayLeaveRequestEmployeeNotification(LeaveRequest leaveRequest);

	void sendApprovedSingleDayLeaveRequestManagerNotification(LeaveRequest leaveRequest);

	void sendApprovedMultiDayLeaveRequestManagerNotification(LeaveRequest leaveRequest);

	void sendRevokedSingleDayLeaveRequestEmployeeNotification(LeaveRequest leaveRequest);

	void sendRevokedMultiDayLeaveRequestEmployeeNotification(LeaveRequest leaveRequest);

	void sendRevokedSingleDayLeaveRequestManagerNotification(LeaveRequest leaveRequest);

	void sendRevokedMultiDayLeaveRequestManagerEmail(LeaveRequest leaveRequest);

	void sendDeclinedSingleDayLeaveRequestEmployeeNotification(LeaveRequest leaveRequest);

	void sendDeclinedMultiDayLeaveRequestEmployeeNotification(LeaveRequest leaveRequest);

	void sendDeclinedSingleDayLeaveRequestManagerNotification(LeaveRequest leaveRequest);

	void sendDeclinedMultiDayLeaveRequestManagerNotification(LeaveRequest leaveRequest);

	void sendAutoApprovedSingleDayLeaveRequestEmployeeNotification(LeaveRequest leaveRequest);

	void sendAutoApprovedMultiDayLeaveRequestEmployeeNotification(LeaveRequest leaveRequest);

	void sendAutoApprovedSingleDayLeaveRequestManagerNotification(LeaveRequest leaveRequest);

	void sendAutoApprovedMultiDayLeaveRequestManagerNotification(LeaveRequest leaveRequest);

	void sendCustomAllocationEmployeeNotification(LeaveEntitlement leaveEntitlement);

	void sendNudgeSingleDayLeaveRequestManagerNotification(LeaveRequest leaveRequest);

	void sendNudgeMultiDayLeaveRequestManagerNotification(LeaveRequest leaveRequest);

}
