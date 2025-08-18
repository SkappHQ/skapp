package com.skapp.community.timeplanner.service.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.service.NotificationService;
import com.skapp.community.common.type.EmailBodyTemplates;
import com.skapp.community.common.type.NotificationCategory;
import com.skapp.community.common.type.NotificationType;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.leaveplanner.model.LeaveRequest;
import com.skapp.community.peopleplanner.model.EmployeeManager;
import com.skapp.community.peopleplanner.repository.EmployeeManagerDao;
import com.skapp.community.peopleplanner.util.PeopleUtil;
import com.skapp.community.timeplanner.model.TimeConfig;
import com.skapp.community.timeplanner.model.TimeRequest;
import com.skapp.community.timeplanner.payload.email.AttendanceEmailDynamicFields;
import com.skapp.community.timeplanner.service.AttendanceNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
@Slf4j
@RequiredArgsConstructor
public class AttendanceNotificationServiceImpl implements AttendanceNotificationService {

	private final NotificationService notificationService;

	private final EmployeeManagerDao employeeManagerDao;

	@Override
	public void sendTimeEntryRequestSubmittedEmployeeNotification(TimeRequest timeRequest) {
		AttendanceEmailDynamicFields attendanceEmailDynamicFields = new AttendanceEmailDynamicFields();
		attendanceEmailDynamicFields
			.setTimeEntryDate(DateTimeUtils.epochMillisToUtcLocalDate(timeRequest.getRequestedStartTime()).toString());

		notificationService.createNotification(timeRequest.getEmployee(), timeRequest.getTimeRequestId().toString(),
				NotificationType.TIME_ENTRY, EmailBodyTemplates.ATTENDANCE_MODULE_TIME_ENTRY_REQUEST_SUBMITTED_EMPLOYEE,
				attendanceEmailDynamicFields, NotificationCategory.ATTENDANCE);
	}

	@Override
	public void sendReceivedTimeEntryRequestManagerNotification(TimeRequest timeRequest) {
		AttendanceEmailDynamicFields attendanceEmailDynamicFields = new AttendanceEmailDynamicFields();
		attendanceEmailDynamicFields
			.setTimeEntryDate(DateTimeUtils.epochMillisToUtcLocalDate(timeRequest.getRequestedStartTime()).toString());
		attendanceEmailDynamicFields
			.setEmployeeName(timeRequest.getEmployee().getFirstName() + " " + timeRequest.getEmployee().getLastName());

		Set<EmployeeManager> employeeManagers = timeRequest.getEmployee().getEmployeeManagers();
		List<EmployeeManager> employeeManagersList = List.copyOf(employeeManagers);

		createAttendanceNotificationForManagers(employeeManagersList, timeRequest.getTimeRequestId().toString(),
				attendanceEmailDynamicFields, EmailBodyTemplates.ATTENDANCE_MODULE_RECEIVED_TIME_ENTRY_REQUEST_MANAGER);
	}

	@Override
	public void sendTimeEntryRequestApprovedEmployeeNotification(TimeRequest timeRequest, User user) {
		AttendanceEmailDynamicFields attendanceEmailDynamicFields = new AttendanceEmailDynamicFields();
		attendanceEmailDynamicFields
			.setTimeEntryDate(DateTimeUtils.epochMillisToUtcLocalDate(timeRequest.getRequestedStartTime()).toString());

		notificationService.createNotification(timeRequest.getEmployee(), timeRequest.getTimeRequestId().toString(),
				NotificationType.TIME_ENTRY, EmailBodyTemplates.ATTENDANCE_MODULE_TIME_ENTRY_REQUEST_APPROVED_EMPLOYEE,
				attendanceEmailDynamicFields, NotificationCategory.ATTENDANCE);
	}

	@Override
	public void sendTimeEntryRequestDeclinedByManagerEmployeeNotification(TimeRequest timeRequest, User user) {
		AttendanceEmailDynamicFields attendanceEmailDynamicFields = new AttendanceEmailDynamicFields();
		attendanceEmailDynamicFields
			.setTimeEntryDate(DateTimeUtils.epochMillisToUtcLocalDate(timeRequest.getRequestedStartTime()).toString());

		notificationService.createNotification(timeRequest.getEmployee(), timeRequest.getTimeRequestId().toString(),
				NotificationType.TIME_ENTRY, EmailBodyTemplates.ATTENDANCE_MODULE_TIME_ENTRY_REQUEST_DECLINED_EMPLOYEE,
				attendanceEmailDynamicFields, NotificationCategory.ATTENDANCE);
	}

	@Override
	public void sendPendingTimeEntryRequestCancelledEmployeeNotification(TimeRequest timeRequest) {
		AttendanceEmailDynamicFields attendanceEmailDynamicFields = new AttendanceEmailDynamicFields();
		attendanceEmailDynamicFields
			.setTimeEntryDate(DateTimeUtils.epochMillisToUtcLocalDate(timeRequest.getRequestedStartTime()).toString());

		notificationService.createNotification(timeRequest.getEmployee(), timeRequest.getTimeRequestId().toString(),
				NotificationType.TIME_ENTRY,
				EmailBodyTemplates.ATTENDANCE_MODULE_PENDING_TIME_ENTRY_REQUEST_CANCELLED_EMPLOYEE,
				attendanceEmailDynamicFields, NotificationCategory.ATTENDANCE);
	}

	@Override
	public void sendPendingTimeEntryRequestCancelledManagerNotification(TimeRequest timeRequest) {
		AttendanceEmailDynamicFields attendanceEmailDynamicFields = new AttendanceEmailDynamicFields();
		attendanceEmailDynamicFields
			.setTimeEntryDate(DateTimeUtils.epochMillisToUtcLocalDate(timeRequest.getRequestedStartTime()).toString());
		attendanceEmailDynamicFields
			.setEmployeeName(timeRequest.getEmployee().getFirstName() + " " + timeRequest.getEmployee().getLastName());

		List<EmployeeManager> employeeManagers = employeeManagerDao.findByEmployee(timeRequest.getEmployee());

		createAttendanceNotificationForManagers(employeeManagers, timeRequest.getTimeRequestId().toString(),
				attendanceEmailDynamicFields,
				EmailBodyTemplates.ATTENDANCE_MODULE_PENDING_TIME_ENTRY_REQUEST_CANCELLED_MANAGER);
	}

	@Override
	public void sendTimeEntryRequestAutoApprovedEmployeeNotification(TimeRequest timeRequest) {
		AttendanceEmailDynamicFields attendanceEmailDynamicFields = new AttendanceEmailDynamicFields();
		attendanceEmailDynamicFields
			.setTimeEntryDate(DateTimeUtils.epochMillisToUtcLocalDate(timeRequest.getRequestedStartTime()).toString());

		notificationService.createNotification(timeRequest.getEmployee(), timeRequest.getTimeRequestId().toString(),
				NotificationType.TIME_ENTRY,
				EmailBodyTemplates.ATTENDANCE_MODULE_TIME_ENTRY_REQUEST_AUTO_APPROVED_EMPLOYEE,
				attendanceEmailDynamicFields, NotificationCategory.ATTENDANCE);
	}

	@Override
	public void sendTimeEntryRequestAutoApprovedManagerNotification(TimeRequest timeRequest) {
		AttendanceEmailDynamicFields attendanceEmailDynamicFields = new AttendanceEmailDynamicFields();
		attendanceEmailDynamicFields
			.setTimeEntryDate(DateTimeUtils.epochMillisToUtcLocalDate(timeRequest.getRequestedStartTime()).toString());
		attendanceEmailDynamicFields
			.setEmployeeName(timeRequest.getEmployee().getFirstName() + " " + timeRequest.getEmployee().getLastName());

		List<EmployeeManager> employeeManagers = employeeManagerDao.findByEmployee(timeRequest.getEmployee());

		createAttendanceNotificationForManagers(employeeManagers, timeRequest.getTimeRequestId().toString(),
				attendanceEmailDynamicFields,
				EmailBodyTemplates.ATTENDANCE_MODULE_TIME_ENTRY_REQUEST_AUTO_APPROVED_MANAGER);
	}

	@Override
	public void sendNonWorkingDaySingleDayPendingLeaveRequestCancelEmployeeNotification(LeaveRequest leaveRequest) {
		AttendanceEmailDynamicFields attendanceEmailDynamicFields = new AttendanceEmailDynamicFields();
		attendanceEmailDynamicFields.setLeaveDuration(leaveRequest.getLeaveState().toString());
		attendanceEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		attendanceEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());

		notificationService.createNotification(leaveRequest.getEmployee(), leaveRequest.getLeaveRequestId().toString(),
				NotificationType.TIME_ENTRY,
				EmailBodyTemplates.ATTENDANCE_MODULE_NON_WORKING_DAY_SINGLE_DAY_PENDING_LEAVE_REQUEST_CANCELED_EMPLOYEE,
				attendanceEmailDynamicFields, NotificationCategory.ATTENDANCE);
	}

	@Override
	public void sendNonWorkingDayMultiDayPendingLeaveRequestCancelEmployeeNotification(LeaveRequest leaveRequest) {
		AttendanceEmailDynamicFields attendanceEmailDynamicFields = new AttendanceEmailDynamicFields();
		attendanceEmailDynamicFields.setLeaveDuration(leaveRequest.getLeaveState().toString());
		attendanceEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		attendanceEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		attendanceEmailDynamicFields.setLeaveEndDate(leaveRequest.getEndDate().toString());

		notificationService.createNotification(leaveRequest.getEmployee(), leaveRequest.getLeaveRequestId().toString(),
				NotificationType.TIME_ENTRY,
				EmailBodyTemplates.ATTENDANCE_MODULE_NON_WORKING_DAY_MULTI_DAY_PENDING_LEAVE_REQUEST_CANCELED_EMPLOYEE,
				attendanceEmailDynamicFields, NotificationCategory.ATTENDANCE);
	}

	@Override
	public void sendNonWorkingDaySingleLeaveRequestRevokedEmployeeNotification(LeaveRequest leaveRequest) {
		AttendanceEmailDynamicFields attendanceEmailDynamicFields = new AttendanceEmailDynamicFields();
		attendanceEmailDynamicFields.setLeaveDuration(leaveRequest.getLeaveState().toString());
		attendanceEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		attendanceEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());

		notificationService.createNotification(leaveRequest.getEmployee(), leaveRequest.getLeaveRequestId().toString(),
				NotificationType.TIME_ENTRY,
				EmailBodyTemplates.ATTENDANCE_MODULE_NON_WORKING_DAY_SINGLE_DAY_APPROVED_LEAVE_REQUEST_REVOKED_EMPLOYEE,
				attendanceEmailDynamicFields, NotificationCategory.ATTENDANCE);
	}

	@Override
	public void sendNonWorkingDayMultiDayApprovedLeaveRequestRevokedEmployeeNotification(LeaveRequest leaveRequest) {
		AttendanceEmailDynamicFields attendanceEmailDynamicFields = new AttendanceEmailDynamicFields();
		attendanceEmailDynamicFields.setLeaveDuration(leaveRequest.getLeaveState().toString());
		attendanceEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		attendanceEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		attendanceEmailDynamicFields.setLeaveEndDate(leaveRequest.getEndDate().toString());

		notificationService.createNotification(leaveRequest.getEmployee(), leaveRequest.getLeaveRequestId().toString(),
				NotificationType.TIME_ENTRY,
				EmailBodyTemplates.ATTENDANCE_MODULE_NON_WORKING_DAY_MULTI_DAY_APPROVED_LEAVE_REQUEST_REVOKED_EMPLOYEE,
				attendanceEmailDynamicFields, NotificationCategory.ATTENDANCE);
	}

	@Override
	public void sendNonWorkingDaySingleDayPendingLeaveRequestCancelManagerNotification(LeaveRequest leaveRequest) {
		AttendanceEmailDynamicFields attendanceEmailDynamicFields = new AttendanceEmailDynamicFields();
		attendanceEmailDynamicFields.setEmployeeName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());
		attendanceEmailDynamicFields.setLeaveDuration(leaveRequest.getLeaveState().toString());
		attendanceEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		attendanceEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());

		List<EmployeeManager> managers = employeeManagerDao.findByEmployee(leaveRequest.getEmployee());

		createAttendanceNotificationForManagers(managers, leaveRequest.getLeaveRequestId().toString(),
				attendanceEmailDynamicFields,
				EmailBodyTemplates.ATTENDANCE_MODULE_NON_WORKING_DAY_SINGLE_DAY_PENDING_LEAVE_REQUEST_CANCELED_MANAGER);
	}

	@Override
	public void sendNonWorkingDayMultiDayPendingLeaveRequestCancelManagerNotification(LeaveRequest leaveRequest,
			List<TimeConfig> removingConfigs) {
		AttendanceEmailDynamicFields attendanceEmailDynamicFields = new AttendanceEmailDynamicFields();
		attendanceEmailDynamicFields.setEmployeeName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());
		attendanceEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		attendanceEmailDynamicFields.setLeaveEndDate(leaveRequest.getEndDate().toString());

		List<EmployeeManager> managers = employeeManagerDao.findByEmployee(leaveRequest.getEmployee());

		createAttendanceNotificationForManagers(managers, leaveRequest.getLeaveRequestId().toString(),
				attendanceEmailDynamicFields,
				EmailBodyTemplates.ATTENDANCE_MODULE_NON_WORKING_DAY_MULTI_DAY_PENDING_LEAVE_REQUEST_CANCELED_MANAGER);
	}

	@Override
	public void sendNonWorkingDaySingleDayApprovedLeaveRequestRevokedManagerNotification(LeaveRequest leaveRequest) {
		AttendanceEmailDynamicFields attendanceEmailDynamicFields = new AttendanceEmailDynamicFields();
		attendanceEmailDynamicFields.setEmployeeName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());
		attendanceEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		attendanceEmailDynamicFields.setLeaveDuration(leaveRequest.getLeaveState().toString());
		attendanceEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());

		List<EmployeeManager> managers = employeeManagerDao.findByEmployee(leaveRequest.getEmployee());

		createAttendanceNotificationForManagers(managers, leaveRequest.getLeaveRequestId().toString(),
				attendanceEmailDynamicFields,
				EmailBodyTemplates.ATTENDANCE_MODULE_NON_WORKING_DAY_SINGLE_DAY_APPROVED_LEAVE_REQUEST_REVOKED_MANAGER);
	}

	@Override
	public void sendNonWorkingDayMultiDayApprovedLeaveRequestRevokedManagerNotification(LeaveRequest leaveRequest) {
		AttendanceEmailDynamicFields attendanceEmailDynamicFields = new AttendanceEmailDynamicFields();
		attendanceEmailDynamicFields.setEmployeeName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());
		attendanceEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		attendanceEmailDynamicFields.setLeaveEndDate(leaveRequest.getStartDate().toString());
		attendanceEmailDynamicFields.setLeaveDuration(leaveRequest.getLeaveState().toString());
		attendanceEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());

		List<EmployeeManager> managers = employeeManagerDao.findByEmployee(leaveRequest.getEmployee());

		createAttendanceNotificationForManagers(managers, leaveRequest.getLeaveRequestId().toString(),
				attendanceEmailDynamicFields,
				EmailBodyTemplates.ATTENDANCE_MODULE_NON_WORKING_DAY_MULTI_DAY_APPROVED_LEAVE_REQUEST_REVOKED_MANAGER);
	}

	@Override
	public void sendTimeEntryRequestApprovedOtherManagerNotification(TimeRequest timeRequest, User user) {
		AttendanceEmailDynamicFields attendanceEmailDynamicFields = new AttendanceEmailDynamicFields();
		attendanceEmailDynamicFields
			.setEmployeeName(timeRequest.getEmployee().getFirstName() + " " + timeRequest.getEmployee().getLastName());
		attendanceEmailDynamicFields
			.setTimeEntryDate(DateTimeUtils.epochMillisToUtcLocalDate(timeRequest.getRequestedStartTime()).toString());

		List<EmployeeManager> otherManagers = getOtherManagers(
				employeeManagerDao.findByEmployee(timeRequest.getEmployee()), user);

		createAttendanceNotificationForManagers(otherManagers, timeRequest.getTimeRequestId().toString(),
				attendanceEmailDynamicFields,
				EmailBodyTemplates.ATTENDANCE_MODULE_TIME_ENTRY_REQUEST_APPROVED_OTHER_MANAGER);
	}

	@Override
	public void sendTimeEntryRequestDeclinedOtherManagerNotification(TimeRequest timeRequest, User user) {
		AttendanceEmailDynamicFields attendanceEmailDynamicFields = new AttendanceEmailDynamicFields();
		attendanceEmailDynamicFields
			.setEmployeeName(timeRequest.getEmployee().getFirstName() + " " + timeRequest.getEmployee().getLastName());
		attendanceEmailDynamicFields
			.setTimeEntryDate(DateTimeUtils.epochMillisToUtcLocalDate(timeRequest.getRequestedStartTime()).toString());

		List<EmployeeManager> otherManagers = getOtherManagers(
				employeeManagerDao.findByEmployee(timeRequest.getEmployee()), user);

		createAttendanceNotificationForManagers(otherManagers, timeRequest.getTimeRequestId().toString(),
				attendanceEmailDynamicFields,
				EmailBodyTemplates.ATTENDANCE_MODULE_TIME_ENTRY_REQUEST_DECLINED_OTHER_MANAGER);
	}

	private List<EmployeeManager> getOtherManagers(List<EmployeeManager> allManagers, User currentManager) {
		return allManagers.stream()
			.filter(manager -> !manager.getManager().getUser().getUserId().equals(currentManager.getUserId()))
			.toList();
	}

	private void createAttendanceNotificationForManagers(List<EmployeeManager> managers, String timeRequestId,
			AttendanceEmailDynamicFields attendanceEmailDynamicFields, EmailBodyTemplates emailBodyTemplates) {
		PeopleUtil.filterManagersByAttendanceRoles(managers)
			.forEach(manager -> notificationService.createNotification(manager.getManager(), timeRequestId,
					NotificationType.TIME_ENTRY, emailBodyTemplates, attendanceEmailDynamicFields,
					NotificationCategory.ATTENDANCE));
	}

}
