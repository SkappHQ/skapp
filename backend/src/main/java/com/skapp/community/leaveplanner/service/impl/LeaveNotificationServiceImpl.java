package com.skapp.community.leaveplanner.service.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.service.NotificationService;
import com.skapp.community.common.type.EmailBodyTemplates;
import com.skapp.community.common.type.NotificationCategory;
import com.skapp.community.common.type.NotificationType;
import com.skapp.community.leaveplanner.model.LeaveEntitlement;
import com.skapp.community.leaveplanner.model.LeaveRequest;
import com.skapp.community.leaveplanner.payload.email.LeaveEmailDynamicFields;
import com.skapp.community.leaveplanner.service.LeaveNotificationService;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeManager;
import com.skapp.community.peopleplanner.repository.EmployeeManagerDao;
import com.skapp.community.peopleplanner.util.PeopleUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class LeaveNotificationServiceImpl implements LeaveNotificationService {

	private final NotificationService notificationService;

	private final EmployeeManagerDao employeeManagerDao;

	@Override
	public void sendApplyLeaveRequestEmployeeNotification(Employee employee, Long leaveRequestId, String leaveDuration,
			String leaveType, LocalDate leaveStartDate, LocalDate leaveEndDate, boolean isSingleDay) {

		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();
		leaveEmailDynamicFields.setLeaveDuration(leaveDuration);
		leaveEmailDynamicFields.setLeaveType(leaveType);
		leaveEmailDynamicFields.setLeaveStartDate(leaveStartDate.toString());

		EmailBodyTemplates emailBodyTemplates;
		if (isSingleDay) {
			emailBodyTemplates = EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_APPLY_SINGLE_DAY_LEAVE;
		}
		else {
			leaveEmailDynamicFields.setLeaveEndDate(leaveEndDate.toString());
			emailBodyTemplates = EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_APPLY_MULTIPLE_DAY_LEAVE;
		}

		notificationService.createNotification(employee, leaveRequestId.toString(), NotificationType.LEAVE_REQUEST,
				emailBodyTemplates, leaveEmailDynamicFields, NotificationCategory.LEAVE);
	}

	@Override
	public void sendReceivedLeaveRequestManagerNotification(List<EmployeeManager> employeeManagers, String firstName,
			String lastName, Long leaveRequestId, String leaveDuration, String leaveTypeName, LocalDate leaveStartDate,
			LocalDate leaveEndDate, boolean isSingleDay) {
		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();
		leaveEmailDynamicFields.setLeaveDuration(leaveDuration);
		leaveEmailDynamicFields.setLeaveType(leaveTypeName);
		leaveEmailDynamicFields.setLeaveStartDate(leaveStartDate.toString());
		leaveEmailDynamicFields.setEmployeesName(String.format("%s %s", firstName, lastName));

		EmailBodyTemplates emailBodyTemplates;
		if (isSingleDay) {
			emailBodyTemplates = EmailBodyTemplates.LEAVE_MODULE_MANAGER_RECEIVED_SINGLE_DAY_LEAVE;
		}
		else {
			leaveEmailDynamicFields.setLeaveEndDate(leaveEndDate.toString());
			emailBodyTemplates = EmailBodyTemplates.LEAVE_MODULE_MANAGER_RECEIVED_MULTIPLE_DAY_LEAVE;
		}

		createLeaveNotificationForManagers(employeeManagers, leaveRequestId.toString(), leaveEmailDynamicFields,
				NotificationType.LEAVE_REQUEST, emailBodyTemplates);
	}

	@Override
	public void sendCancelLeaveRequestEmployeeNotification(Employee employee, List<EmployeeManager> employeeManagers,
			LeaveRequest leaveRequest, boolean isSingleDay) {
		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();
		leaveEmailDynamicFields.setLeaveDuration(leaveRequest.getLeaveState().toString());
		leaveEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		leaveEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());

		EmailBodyTemplates emailBodyTemplates;
		if (isSingleDay) {
			emailBodyTemplates = EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_CANCEL_SINGLE_DAY_LEAVE;
		}
		else {
			leaveEmailDynamicFields.setLeaveEndDate(leaveRequest.getEndDate().toString());
			emailBodyTemplates = EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_CANCEL_MULTIPLE_DAY_LEAVE;
		}

		notificationService.createNotification(employee, leaveRequest.getLeaveRequestId().toString(),
				NotificationType.LEAVE_REQUEST, emailBodyTemplates, leaveEmailDynamicFields,
				NotificationCategory.LEAVE);
	}

	@Override
	public void sendCancelLeaveRequestManagerNotification(Employee employee, List<EmployeeManager> employeeManagers,
			LeaveRequest leaveRequest, boolean isSingleDay) {
		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();
		leaveEmailDynamicFields.setLeaveDuration(leaveRequest.getLeaveState().toString());
		leaveEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		leaveEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		leaveEmailDynamicFields
			.setEmployeesName(String.format("%s %s", employee.getFirstName(), employee.getLastName()));

		EmailBodyTemplates emailBodyTemplates;
		if (isSingleDay) {
			emailBodyTemplates = EmailBodyTemplates.LEAVE_MODULE_MANAGER_CANCEL_SINGLE_DAY_LEAVE;
		}
		else {
			leaveEmailDynamicFields.setLeaveEndDate(leaveRequest.getEndDate().toString());
			emailBodyTemplates = EmailBodyTemplates.LEAVE_MODULE_MANAGER_CANCEL_MULTIPLE_DAY_LEAVE;
		}

		createLeaveNotificationForManagers(employeeManagers, leaveRequest.getLeaveRequestId().toString(),
				leaveEmailDynamicFields, NotificationType.LEAVE_REQUEST, emailBodyTemplates);
	}

	@Override
	public void sendApprovedSingleDayLeaveRequestEmployeeNotification(LeaveRequest leaveRequest) {
		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();
		leaveEmailDynamicFields.setLeaveDuration(leaveRequest.getLeaveState().toString());
		leaveEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		leaveEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());

		notificationService.createNotification(leaveRequest.getEmployee(), leaveRequest.getLeaveRequestId().toString(),
				NotificationType.LEAVE_REQUEST, EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_APPROVED_SINGLE_DAY_LEAVE,
				leaveEmailDynamicFields, NotificationCategory.LEAVE);
	}

	@Override
	public void sendApprovedMultiDayLeaveRequestEmployeeNotification(LeaveRequest leaveRequest) {
		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();
		leaveEmailDynamicFields.setLeaveDuration(leaveRequest.getLeaveState().toString());
		leaveEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		leaveEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		leaveEmailDynamicFields.setLeaveEndDate(leaveRequest.getEndDate().toString());

		notificationService.createNotification(leaveRequest.getEmployee(), leaveRequest.getLeaveRequestId().toString(),
				NotificationType.LEAVE_REQUEST, EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_APPROVED_MULTI_DAY_LEAVE,
				leaveEmailDynamicFields, NotificationCategory.LEAVE);
	}

	@Override
	public void sendApprovedSingleDayLeaveRequestManagerNotification(LeaveRequest leaveRequest) {
		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();
		leaveEmailDynamicFields.setEmployeeName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());
		leaveEmailDynamicFields.setLeaveDuration(leaveRequest.getLeaveState().toString());
		leaveEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		leaveEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());

		List<EmployeeManager> otherManagers = getOtherManagers(
				employeeManagerDao.findByEmployee(leaveRequest.getEmployee()), leaveRequest.getReviewer().getUser());

		createLeaveNotificationForManagers(otherManagers, leaveRequest.getLeaveRequestId().toString(),
				leaveEmailDynamicFields, NotificationType.LEAVE_REQUEST,
				EmailBodyTemplates.LEAVE_MODULE_MANAGER_APPROVED_SINGLE_DAY_LEAVE);
	}

	@Override
	public void sendApprovedMultiDayLeaveRequestManagerNotification(LeaveRequest leaveRequest) {
		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();
		leaveEmailDynamicFields.setEmployeeName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());
		leaveEmailDynamicFields.setLeaveDuration(leaveRequest.getLeaveState().toString());
		leaveEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		leaveEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		leaveEmailDynamicFields.setLeaveEndDate(leaveRequest.getEndDate().toString());

		List<EmployeeManager> otherManagers = getOtherManagers(
				employeeManagerDao.findByEmployee(leaveRequest.getEmployee()), leaveRequest.getReviewer().getUser());

		createLeaveNotificationForManagers(otherManagers, leaveRequest.getLeaveRequestId().toString(),
				leaveEmailDynamicFields, NotificationType.LEAVE_REQUEST,
				EmailBodyTemplates.LEAVE_MODULE_MANAGER_APPROVED_MULTI_DAY_LEAVE);
	}

	@Override
	public void sendRevokedSingleDayLeaveRequestEmployeeNotification(LeaveRequest leaveRequest) {
		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();
		leaveEmailDynamicFields.setLeaveDuration(leaveRequest.getLeaveState().toString());
		leaveEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		leaveEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());

		notificationService.createNotification(leaveRequest.getEmployee(), leaveRequest.getLeaveRequestId().toString(),
				NotificationType.LEAVE_REQUEST, EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_REVOKED_SINGLE_DAY_LEAVE,
				leaveEmailDynamicFields, NotificationCategory.LEAVE);
	}

	@Override
	public void sendRevokedMultiDayLeaveRequestEmployeeNotification(LeaveRequest leaveRequest) {
		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();
		leaveEmailDynamicFields.setLeaveDuration(leaveRequest.getLeaveState().toString());
		leaveEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		leaveEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		leaveEmailDynamicFields.setLeaveEndDate(leaveRequest.getEndDate().toString());

		notificationService.createNotification(leaveRequest.getEmployee(), leaveRequest.getLeaveRequestId().toString(),
				NotificationType.LEAVE_REQUEST, EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_REVOKED_MULTI_DAY_LEAVE,
				leaveEmailDynamicFields, NotificationCategory.LEAVE);
	}

	@Override
	public void sendRevokedSingleDayLeaveRequestManagerNotification(LeaveRequest leaveRequest) {
		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();
		leaveEmailDynamicFields.setEmployeeName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());
		leaveEmailDynamicFields.setLeaveDuration(leaveRequest.getLeaveState().toString());
		leaveEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		leaveEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());

		List<EmployeeManager> otherManagers = getOtherManagers(
				employeeManagerDao.findByEmployee(leaveRequest.getEmployee()), leaveRequest.getReviewer().getUser());

		createLeaveNotificationForManagers(otherManagers, leaveRequest.getLeaveRequestId().toString(),
				leaveEmailDynamicFields, NotificationType.LEAVE_REQUEST,
				EmailBodyTemplates.LEAVE_MODULE_MANAGER_REVOKED_SINGLE_DAY_LEAVE);
	}

	@Override
	public void sendRevokedMultiDayLeaveRequestManagerEmail(LeaveRequest leaveRequest) {
		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();
		leaveEmailDynamicFields.setEmployeeName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());
		leaveEmailDynamicFields.setLeaveDuration(leaveRequest.getLeaveState().toString());
		leaveEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		leaveEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());

		List<EmployeeManager> otherManagers = getOtherManagers(
				employeeManagerDao.findByEmployee(leaveRequest.getEmployee()), leaveRequest.getReviewer().getUser());

		createLeaveNotificationForManagers(otherManagers, leaveRequest.getLeaveRequestId().toString(),
				leaveEmailDynamicFields, NotificationType.LEAVE_REQUEST,
				EmailBodyTemplates.LEAVE_MODULE_MANAGER_REVOKED_MULTI_DAY_LEAVE);
	}

	@Override
	public void sendDeclinedSingleDayLeaveRequestEmployeeNotification(LeaveRequest leaveRequest) {
		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();
		leaveEmailDynamicFields.setLeaveDuration(leaveRequest.getLeaveState().toString());
		leaveEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		leaveEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());

		notificationService.createNotification(leaveRequest.getEmployee(), leaveRequest.getLeaveRequestId().toString(),
				NotificationType.LEAVE_REQUEST, EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_DECLINED_SINGLE_DAY_LEAVE,
				leaveEmailDynamicFields, NotificationCategory.LEAVE);
	}

	@Override
	public void sendDeclinedMultiDayLeaveRequestEmployeeNotification(LeaveRequest leaveRequest) {
		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();
		leaveEmailDynamicFields.setLeaveDuration(leaveRequest.getLeaveState().toString());
		leaveEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		leaveEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		leaveEmailDynamicFields.setLeaveEndDate(leaveRequest.getEndDate().toString());

		notificationService.createNotification(leaveRequest.getEmployee(), leaveRequest.getLeaveRequestId().toString(),
				NotificationType.LEAVE_REQUEST, EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_DECLINED_MULTI_DAY_LEAVE,
				leaveEmailDynamicFields, NotificationCategory.LEAVE);
	}

	@Override
	public void sendDeclinedSingleDayLeaveRequestManagerNotification(LeaveRequest leaveRequest) {
		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();
		leaveEmailDynamicFields.setEmployeeName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());
		leaveEmailDynamicFields.setLeaveDuration(leaveRequest.getLeaveState().toString());
		leaveEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		leaveEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());

		List<EmployeeManager> otherManagers = getOtherManagers(
				employeeManagerDao.findByEmployee(leaveRequest.getEmployee()), leaveRequest.getReviewer().getUser());

		createLeaveNotificationForManagers(otherManagers, leaveRequest.getLeaveRequestId().toString(),
				leaveEmailDynamicFields, NotificationType.LEAVE_REQUEST,
				EmailBodyTemplates.LEAVE_MODULE_MANAGER_DECLINED_SINGLE_DAY_LEAVE);
	}

	@Override
	public void sendDeclinedMultiDayLeaveRequestManagerNotification(LeaveRequest leaveRequest) {
		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();
		leaveEmailDynamicFields.setEmployeeName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());
		leaveEmailDynamicFields.setLeaveDuration(leaveRequest.getLeaveState().toString());
		leaveEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		leaveEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());

		List<EmployeeManager> otherManagers = getOtherManagers(
				employeeManagerDao.findByEmployee(leaveRequest.getEmployee()), leaveRequest.getReviewer().getUser());

		createLeaveNotificationForManagers(otherManagers, leaveRequest.getLeaveRequestId().toString(),
				leaveEmailDynamicFields, NotificationType.LEAVE_REQUEST,
				EmailBodyTemplates.LEAVE_MODULE_MANAGER_DECLINED_MULTI_DAY_LEAVE);
	}

	@Override
	public void sendAutoApprovedSingleDayLeaveRequestEmployeeNotification(LeaveRequest leaveRequest) {
		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();
		leaveEmailDynamicFields.setLeaveDuration(leaveRequest.getLeaveState().toString());
		leaveEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		leaveEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());

		notificationService.createNotification(leaveRequest.getEmployee(), leaveRequest.getLeaveRequestId().toString(),
				NotificationType.LEAVE_REQUEST, EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_AUTO_APPROVED_SINGLE_DAY_LEAVE,
				leaveEmailDynamicFields, NotificationCategory.LEAVE);
	}

	@Override
	public void sendAutoApprovedMultiDayLeaveRequestEmployeeNotification(LeaveRequest leaveRequest) {
		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();
		leaveEmailDynamicFields.setLeaveDuration(leaveRequest.getLeaveState().toString());
		leaveEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		leaveEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		leaveEmailDynamicFields.setLeaveEndDate(leaveRequest.getEndDate().toString());

		notificationService.createNotification(leaveRequest.getEmployee(), leaveRequest.getLeaveRequestId().toString(),
				NotificationType.LEAVE_REQUEST, EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_AUTO_APPROVED_MULTI_DAY_LEAVE,
				leaveEmailDynamicFields, NotificationCategory.LEAVE);
	}

	@Override
	public void sendAutoApprovedSingleDayLeaveRequestManagerNotification(LeaveRequest leaveRequest) {
		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();
		leaveEmailDynamicFields.setEmployeeName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());
		leaveEmailDynamicFields.setLeaveDuration(leaveRequest.getLeaveState().toString());
		leaveEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		leaveEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());

		List<EmployeeManager> otherManagers = getOtherManagers(
				employeeManagerDao.findByEmployee(leaveRequest.getEmployee()), leaveRequest.getReviewer().getUser());

		createLeaveNotificationForManagers(otherManagers, leaveRequest.getLeaveRequestId().toString(),
				leaveEmailDynamicFields, NotificationType.LEAVE_REQUEST,
				EmailBodyTemplates.LEAVE_MODULE_MANAGER_AUTO_APPROVED_SINGLE_DAY_LEAVE);
	}

	@Override
	public void sendAutoApprovedMultiDayLeaveRequestManagerNotification(LeaveRequest leaveRequest) {
		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();
		leaveEmailDynamicFields.setEmployeeName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());
		leaveEmailDynamicFields.setLeaveDuration(leaveRequest.getLeaveState().toString());
		leaveEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		leaveEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		leaveEmailDynamicFields.setLeaveEndDate(leaveRequest.getEndDate().toString());

		List<EmployeeManager> otherManagers = getOtherManagers(
				employeeManagerDao.findByEmployee(leaveRequest.getEmployee()), leaveRequest.getReviewer().getUser());

		createLeaveNotificationForManagers(otherManagers, leaveRequest.getLeaveRequestId().toString(),
				leaveEmailDynamicFields, NotificationType.LEAVE_REQUEST,
				EmailBodyTemplates.LEAVE_MODULE_MANAGER_AUTO_APPROVED_MULTI_DAY_LEAVE);
	}

	@Override
	public void sendCustomAllocationEmployeeNotification(LeaveEntitlement leaveEntitlement) {
		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();
		leaveEmailDynamicFields.setLeaveType(leaveEntitlement.getLeaveType().getName());
		leaveEmailDynamicFields.setDuration(leaveEntitlement.getTotalDaysAllocated().toString());

		notificationService.createNotification(leaveEntitlement.getEmployee(),
				leaveEntitlement.getEntitlementId().toString(), NotificationType.LEAVE_ENTITLEMENT,
				EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_CUSTOM_ALLOCATION, leaveEmailDynamicFields,
				NotificationCategory.LEAVE);
	}

	@Override
	public void sendNudgeSingleDayLeaveRequestManagerNotification(LeaveRequest leaveRequest) {
		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();

		leaveEmailDynamicFields.setEmployeesName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());

		List<EmployeeManager> managers = employeeManagerDao.findByEmployee(leaveRequest.getEmployee());

		createLeaveNotificationForManagers(managers, leaveRequest.getLeaveRequestId().toString(),
				leaveEmailDynamicFields, NotificationType.LEAVE_REQUEST_NUDGE,
				EmailBodyTemplates.LEAVE_MODULE_MANAGER_NUDGE_SINGLE_DAY_LEAVE);
	}

	@Override
	public void sendNudgeMultiDayLeaveRequestManagerNotification(LeaveRequest leaveRequest) {
		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();

		leaveEmailDynamicFields.setEmployeesName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());

		List<EmployeeManager> managers = employeeManagerDao.findByEmployee(leaveRequest.getEmployee());

		createLeaveNotificationForManagers(managers, leaveRequest.getLeaveRequestId().toString(),
				leaveEmailDynamicFields, NotificationType.LEAVE_REQUEST_NUDGE,
				EmailBodyTemplates.LEAVE_MODULE_MANAGER_NUDGE_MULTI_DAY_LEAVE);

		notificationService.createNotification(leaveRequest.getEmployee(), leaveRequest.getLeaveRequestId().toString(),
				NotificationType.LEAVE_REQUEST_NUDGE, EmailBodyTemplates.LEAVE_MODULE_MANAGER_NUDGE_MULTI_DAY_LEAVE,
				leaveEmailDynamicFields, NotificationCategory.LEAVE);
	}

	private List<EmployeeManager> getOtherManagers(List<EmployeeManager> allManagers, User currentManager) {
		return allManagers.stream()
			.filter(manager -> !manager.getManager().getUser().getUserId().equals(currentManager.getUserId()))
			.toList();
	}

	private void createLeaveNotificationForManagers(List<EmployeeManager> managers, String leaveRequestId,
			LeaveEmailDynamicFields leaveEmailDynamicFields, NotificationType notificationType,
			EmailBodyTemplates emailBodyTemplates) {
		PeopleUtil.filterManagersByLeaveRoles(managers)
			.forEach(employeeManager -> notificationService.createNotification(employeeManager.getManager(),
					leaveRequestId, notificationType, emailBodyTemplates, leaveEmailDynamicFields,
					NotificationCategory.LEAVE));
	}

}
