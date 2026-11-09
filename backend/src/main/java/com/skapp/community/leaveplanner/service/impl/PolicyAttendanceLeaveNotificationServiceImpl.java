package com.skapp.community.leaveplanner.service.impl;

import com.skapp.community.common.service.NotificationService;
import com.skapp.community.common.type.EmailBodyTemplates;
import com.skapp.community.common.type.NotificationCategory;
import com.skapp.community.common.type.NotificationType;
import com.skapp.community.leaveplanner.model.PolicyLeaveRequest;
import com.skapp.community.leaveplanner.service.PolicyAttendanceLeaveNotificationService;
import com.skapp.community.peopleplanner.repository.EmployeeManagerDao;
import com.skapp.community.peopleplanner.util.PeopleUtil;
import com.skapp.community.timeplanner.payload.email.AttendanceEmailDynamicFields;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class PolicyAttendanceLeaveNotificationServiceImpl implements PolicyAttendanceLeaveNotificationService {

	private final NotificationService notificationService;

	private final EmployeeManagerDao employeeManagerDao;

	@Override
	public void sendNonWorkingDaySingleDayPendingLeaveRequestCancelEmployeeNotification(
			PolicyLeaveRequest policyLeaveRequest) {
		AttendanceEmailDynamicFields attendanceEmailDynamicFields = new AttendanceEmailDynamicFields();
		attendanceEmailDynamicFields.setLeaveDuration(String.valueOf(policyLeaveRequest.getLeaveState()));
		attendanceEmailDynamicFields.setLeaveType(policyLeaveRequest.getPolicy().getLeaveType().getName());
		attendanceEmailDynamicFields.setLeaveStartDate(policyLeaveRequest.getStartDate().toString());

		createEmployeeNotification(policyLeaveRequest, attendanceEmailDynamicFields,
				EmailBodyTemplates.ATTENDANCE_MODULE_NON_WORKING_DAY_SINGLE_DAY_PENDING_LEAVE_REQUEST_CANCELED_EMPLOYEE);
	}

	@Override
	public void sendNonWorkingDaySingleDayPendingLeaveRequestCancelManagerNotification(
			PolicyLeaveRequest policyLeaveRequest) {
		AttendanceEmailDynamicFields attendanceEmailDynamicFields = new AttendanceEmailDynamicFields();
		attendanceEmailDynamicFields.setEmployeeName(policyLeaveRequest.getEmployee().getFullName());
		attendanceEmailDynamicFields.setLeaveDuration(String.valueOf(policyLeaveRequest.getLeaveState()));
		attendanceEmailDynamicFields.setLeaveType(policyLeaveRequest.getPolicy().getLeaveType().getName());
		attendanceEmailDynamicFields.setLeaveStartDate(policyLeaveRequest.getStartDate().toString());

		createManagerNotifications(policyLeaveRequest, attendanceEmailDynamicFields,
				EmailBodyTemplates.ATTENDANCE_MODULE_NON_WORKING_DAY_SINGLE_DAY_PENDING_LEAVE_REQUEST_CANCELED_MANAGER);
	}

	@Override
	public void sendNonWorkingDayMultiDayPendingLeaveRequestCancelEmployeeNotification(
			PolicyLeaveRequest policyLeaveRequest) {
		AttendanceEmailDynamicFields attendanceEmailDynamicFields = new AttendanceEmailDynamicFields();
		attendanceEmailDynamicFields.setLeaveDuration(String.valueOf(policyLeaveRequest.getLeaveState()));
		attendanceEmailDynamicFields.setLeaveType(policyLeaveRequest.getPolicy().getLeaveType().getName());
		attendanceEmailDynamicFields.setLeaveStartDate(policyLeaveRequest.getStartDate().toString());
		attendanceEmailDynamicFields.setLeaveEndDate(policyLeaveRequest.getEndDate().toString());

		createEmployeeNotification(policyLeaveRequest, attendanceEmailDynamicFields,
				EmailBodyTemplates.ATTENDANCE_MODULE_NON_WORKING_DAY_MULTI_DAY_PENDING_LEAVE_REQUEST_CANCELED_EMPLOYEE);
	}

	@Override
	public void sendNonWorkingDayMultiDayPendingLeaveRequestCancelManagerNotification(
			PolicyLeaveRequest policyLeaveRequest) {
		AttendanceEmailDynamicFields attendanceEmailDynamicFields = new AttendanceEmailDynamicFields();
		attendanceEmailDynamicFields.setEmployeeName(policyLeaveRequest.getEmployee().getFullName());
		attendanceEmailDynamicFields.setLeaveStartDate(policyLeaveRequest.getStartDate().toString());
		attendanceEmailDynamicFields.setLeaveEndDate(policyLeaveRequest.getEndDate().toString());

		createManagerNotifications(policyLeaveRequest, attendanceEmailDynamicFields,
				EmailBodyTemplates.ATTENDANCE_MODULE_NON_WORKING_DAY_MULTI_DAY_PENDING_LEAVE_REQUEST_CANCELED_MANAGER);
	}

	@Override
	public void sendNonWorkingDaySingleDayApprovedLeaveRequestRevokedEmployeeNotification(
			PolicyLeaveRequest policyLeaveRequest) {
		AttendanceEmailDynamicFields attendanceEmailDynamicFields = new AttendanceEmailDynamicFields();
		attendanceEmailDynamicFields.setLeaveDuration(String.valueOf(policyLeaveRequest.getLeaveState()));
		attendanceEmailDynamicFields.setLeaveType(policyLeaveRequest.getPolicy().getLeaveType().getName());
		attendanceEmailDynamicFields.setLeaveStartDate(policyLeaveRequest.getStartDate().toString());

		createEmployeeNotification(policyLeaveRequest, attendanceEmailDynamicFields,
				EmailBodyTemplates.ATTENDANCE_MODULE_NON_WORKING_DAY_SINGLE_DAY_APPROVED_LEAVE_REQUEST_REVOKED_EMPLOYEE);
	}

	@Override
	public void sendNonWorkingDaySingleDayApprovedLeaveRequestRevokedManagerNotification(
			PolicyLeaveRequest policyLeaveRequest) {
		AttendanceEmailDynamicFields attendanceEmailDynamicFields = new AttendanceEmailDynamicFields();
		attendanceEmailDynamicFields.setEmployeeName(policyLeaveRequest.getEmployee().getFullName());
		attendanceEmailDynamicFields.setLeaveStartDate(policyLeaveRequest.getStartDate().toString());
		attendanceEmailDynamicFields.setLeaveDuration(String.valueOf(policyLeaveRequest.getLeaveState()));
		attendanceEmailDynamicFields.setLeaveType(policyLeaveRequest.getPolicy().getLeaveType().getName());

		createManagerNotifications(policyLeaveRequest, attendanceEmailDynamicFields,
				EmailBodyTemplates.ATTENDANCE_MODULE_NON_WORKING_DAY_SINGLE_DAY_APPROVED_LEAVE_REQUEST_REVOKED_MANAGER);
	}

	@Override
	public void sendNonWorkingDayMultiDayApprovedLeaveRequestRevokedEmployeeNotification(
			PolicyLeaveRequest policyLeaveRequest) {
		AttendanceEmailDynamicFields attendanceEmailDynamicFields = new AttendanceEmailDynamicFields();
		attendanceEmailDynamicFields.setLeaveDuration(String.valueOf(policyLeaveRequest.getLeaveState()));
		attendanceEmailDynamicFields.setLeaveType(policyLeaveRequest.getPolicy().getLeaveType().getName());
		attendanceEmailDynamicFields.setLeaveStartDate(policyLeaveRequest.getStartDate().toString());
		attendanceEmailDynamicFields.setLeaveEndDate(policyLeaveRequest.getEndDate().toString());

		createEmployeeNotification(policyLeaveRequest, attendanceEmailDynamicFields,
				EmailBodyTemplates.ATTENDANCE_MODULE_NON_WORKING_DAY_MULTI_DAY_APPROVED_LEAVE_REQUEST_REVOKED_EMPLOYEE);
	}

	@Override
	public void sendNonWorkingDayMultiDayApprovedLeaveRequestRevokedManagerNotification(
			PolicyLeaveRequest policyLeaveRequest) {
		AttendanceEmailDynamicFields attendanceEmailDynamicFields = new AttendanceEmailDynamicFields();
		attendanceEmailDynamicFields.setEmployeeName(policyLeaveRequest.getEmployee().getFullName());
		attendanceEmailDynamicFields.setLeaveStartDate(policyLeaveRequest.getStartDate().toString());
		attendanceEmailDynamicFields.setLeaveEndDate(policyLeaveRequest.getEndDate().toString());
		attendanceEmailDynamicFields.setLeaveDuration(String.valueOf(policyLeaveRequest.getLeaveState()));
		attendanceEmailDynamicFields.setLeaveType(policyLeaveRequest.getPolicy().getLeaveType().getName());

		createManagerNotifications(policyLeaveRequest, attendanceEmailDynamicFields,
				EmailBodyTemplates.ATTENDANCE_MODULE_NON_WORKING_DAY_MULTI_DAY_APPROVED_LEAVE_REQUEST_REVOKED_MANAGER);
	}

	private void createEmployeeNotification(PolicyLeaveRequest policyLeaveRequest,
			AttendanceEmailDynamicFields attendanceEmailDynamicFields, EmailBodyTemplates emailBodyTemplate) {
		notificationService.createNotification(policyLeaveRequest.getEmployee(), policyLeaveRequest.getId().toString(),
				NotificationType.TIME_ENTRY, emailBodyTemplate, attendanceEmailDynamicFields,
				NotificationCategory.ATTENDANCE);
	}

	private void createManagerNotifications(PolicyLeaveRequest policyLeaveRequest,
			AttendanceEmailDynamicFields attendanceEmailDynamicFields, EmailBodyTemplates emailBodyTemplate) {
		PeopleUtil.filterManagersByAttendanceRoles(employeeManagerDao.findByEmployee(policyLeaveRequest.getEmployee()))
			.forEach(manager -> notificationService.createNotification(manager.getManager(),
					policyLeaveRequest.getId().toString(), NotificationType.TIME_ENTRY, emailBodyTemplate,
					attendanceEmailDynamicFields, NotificationCategory.ATTENDANCE));
	}

}
