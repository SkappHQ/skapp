package com.skapp.community.peopleplanner.service.impl;

import com.skapp.community.common.model.Organization;
import com.skapp.community.common.model.User;
import com.skapp.community.common.repository.OrganizationDao;
import com.skapp.community.common.repository.UserDao;
import com.skapp.community.common.service.NotificationService;
import com.skapp.community.common.type.EmailBodyTemplates;
import com.skapp.community.common.type.NotificationCategory;
import com.skapp.community.common.type.NotificationType;
import com.skapp.community.leaveplanner.model.LeaveRequest;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.model.Holiday;
import com.skapp.community.peopleplanner.payload.email.PeopleEmailDynamicFields;
import com.skapp.community.peopleplanner.repository.EmployeeRoleDao;
import com.skapp.community.peopleplanner.service.PeopleNotificationService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import static com.skapp.community.common.type.Role.PEOPLE_ADMIN;

@Service
@Slf4j
@RequiredArgsConstructor
public class PeopleNotificationServiceImpl implements PeopleNotificationService {

	@NonNull
	private final NotificationService notificationService;

	@NonNull
	private final OrganizationDao organizationDao;

	@NonNull
	private final UserDao userDao;

	@NonNull
	private final EmployeeRoleDao employeeRoleDao;

	@Async
	@Transactional(readOnly = true)
	@Override
	public void sendNewHolidayDeclarationNotification(Holiday holiday) {
		try {
			PeopleEmailDynamicFields peopleEmailDynamicFields = new PeopleEmailDynamicFields();
			peopleEmailDynamicFields.setOrganizationName(getOrganizationName());
			peopleEmailDynamicFields.setHolidayDate(holiday.getDate().toString());
			peopleEmailDynamicFields.setHolidayName(holiday.getName());

			List<User> users = userDao.findAllByIsActiveTrue();
			users.forEach(user -> notificationService.createNotification(user.getEmployee(), holiday.getId().toString(),
					NotificationType.HOLIDAY, EmailBodyTemplates.PEOPLE_MODULE_NEW_HOLIDAY_DECLARED,
					peopleEmailDynamicFields, NotificationCategory.PEOPLE));
		}
		catch (Exception e) {
			log.error("Error sending new holiday declaration notification for holiday: {}", holiday.getName(), e);
		}
	}

	@Override
	public void sendHolidaySingleDayPendingLeaveRequestCancellationEmployeeNotification(LeaveRequest leaveRequest,
			Holiday holiday) {
		PeopleEmailDynamicFields peopleEmailDynamicFields = new PeopleEmailDynamicFields();
		peopleEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());

		notificationService.createNotification(leaveRequest.getEmployee(), holiday.getId().toString(),
				NotificationType.HOLIDAY,
				EmailBodyTemplates.PEOPLE_MODULE_HOLIDAY_SINGLE_DAY_PENDING_LEAVE_REQUEST_CANCELED_EMPLOYEE,
				peopleEmailDynamicFields, NotificationCategory.PEOPLE);
	}

	@Override
	public void sendHolidayMultipleDayPendingLeaveRequestUpdatedEmployeeNotification(LeaveRequest leaveRequest,
			Holiday holiday) {
		PeopleEmailDynamicFields peopleEmailDynamicFields = new PeopleEmailDynamicFields();
		peopleEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());

		notificationService.createNotification(leaveRequest.getEmployee(), holiday.getId().toString(),
				NotificationType.HOLIDAY,
				EmailBodyTemplates.PEOPLE_MODULE_HOLIDAY_MULTI_DAY_PENDING_LEAVE_REQUEST_UPDATED_EMPLOYEE,
				peopleEmailDynamicFields, NotificationCategory.PEOPLE);
	}

	@Override
	public void sendHolidaySingleDayApprovedLeaveRequestRevokedEmployeeNotification(LeaveRequest leaveRequest,
			Holiday holiday) {
		PeopleEmailDynamicFields peopleEmailDynamicFields = new PeopleEmailDynamicFields();
		peopleEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());

		notificationService.createNotification(leaveRequest.getEmployee(), holiday.getId().toString(),
				NotificationType.HOLIDAY,
				EmailBodyTemplates.PEOPLE_MODULE_HOLIDAY_SINGLE_DAY_APPROVED_LEAVE_REQUEST_REVOKED_EMPLOYEE,
				peopleEmailDynamicFields, NotificationCategory.PEOPLE);
	}

	@Override
	public void sendHolidayMultipleDayApprovedLeaveRequestUpdatedEmployeeNotification(LeaveRequest leaveRequest,
			Holiday holiday) {
		PeopleEmailDynamicFields peopleEmailDynamicFields = new PeopleEmailDynamicFields();
		peopleEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		peopleEmailDynamicFields.setLeaveEndDate(leaveRequest.getEndDate().toString());

		notificationService.createNotification(leaveRequest.getEmployee(), holiday.getId().toString(),
				NotificationType.HOLIDAY,
				EmailBodyTemplates.PEOPLE_MODULE_HOLIDAY_MULTI_DAY_APPROVED_LEAVE_REQUEST_UPDATED_EMPLOYEE,
				peopleEmailDynamicFields, NotificationCategory.PEOPLE);
	}

	@Override
	public void sendHolidaySingleDayPendingLeaveRequestCancellationManagerNotification(LeaveRequest leaveRequest,
			Holiday holiday) {
		PeopleEmailDynamicFields peopleEmailDynamicFields = new PeopleEmailDynamicFields();
		peopleEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		peopleEmailDynamicFields.setEmployeeName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());

		leaveRequest.getEmployee()
			.getEmployeeManagers()
			.forEach(employeeManager -> notificationService.createNotification(employeeManager.getManager(),
					holiday.getId().toString(), NotificationType.HOLIDAY,
					EmailBodyTemplates.PEOPLE_MODULE_HOLIDAY_MULTI_DAY_APPROVED_LEAVE_REQUEST_UPDATED_EMPLOYEE,
					peopleEmailDynamicFields, NotificationCategory.PEOPLE));
	}

	@Override
	public void sendHolidayMultipleDayPendingLeaveRequestUpdatedManagerNotification(LeaveRequest leaveRequest,
			Holiday holiday) {
		PeopleEmailDynamicFields peopleEmailDynamicFields = new PeopleEmailDynamicFields();
		peopleEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		peopleEmailDynamicFields.setEmployeeName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());

		leaveRequest.getEmployee()
			.getEmployeeManagers()
			.forEach(employeeManager -> notificationService.createNotification(employeeManager.getManager(),
					holiday.getId().toString(), NotificationType.HOLIDAY,
					EmailBodyTemplates.PEOPLE_MODULE_HOLIDAY_DAY_MULTI_DAY_PENDING_LEAVE_REQUEST_UPDATED_MANAGER,
					peopleEmailDynamicFields, NotificationCategory.PEOPLE));
	}

	@Override
	public void sendHolidaySingleDayApprovedLeaveRequestRevokedManagerNotification(LeaveRequest leaveRequest,
			Holiday holiday) {
		PeopleEmailDynamicFields peopleEmailDynamicFields = new PeopleEmailDynamicFields();
		peopleEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		peopleEmailDynamicFields.setEmployeeName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());

		leaveRequest.getEmployee()
			.getEmployeeManagers()
			.forEach(employeeManager -> notificationService.createNotification(employeeManager.getManager(),
					holiday.getId().toString(), NotificationType.HOLIDAY,
					EmailBodyTemplates.PEOPLE_MODULE_HOLIDAY_DAY_SINGLE_DAY_APPROVED_LEAVE_REQUEST_REVOKED_MANAGER,
					peopleEmailDynamicFields, NotificationCategory.PEOPLE));
	}

	@Override
	public void sendHolidayMultipleDayApprovedLeaveRequestUpdatedManagerEmail(LeaveRequest leaveRequest,
			Holiday holiday) {
		PeopleEmailDynamicFields peopleEmailDynamicFields = new PeopleEmailDynamicFields();
		peopleEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		peopleEmailDynamicFields.setLeaveEndDate(leaveRequest.getEndDate().toString());
		peopleEmailDynamicFields.setEmployeeName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());

		leaveRequest.getEmployee()
			.getEmployeeManagers()
			.forEach(employeeManager -> notificationService.createNotification(employeeManager.getManager(),
					holiday.getId().toString(), NotificationType.HOLIDAY,
					EmailBodyTemplates.PEOPLE_MODULE_HOLIDAY_MULTI_DAY_APPROVED_LEAVE_REQUEST_UPDATED_MANAGER,
					peopleEmailDynamicFields, NotificationCategory.PEOPLE));
	}

	@Override
	public void sendPasswordResetRequestManagerNotification(User user, String requestDateTime) {
		PeopleEmailDynamicFields notificationDynamicFields = new PeopleEmailDynamicFields();
		notificationDynamicFields.setRequestDateTime(requestDateTime);
		notificationDynamicFields
			.setEmployeeName(user.getEmployee().getFirstName() + " " + user.getEmployee().getLastName());

		List<EmployeeRole> employeeRoles = employeeRoleDao.findEmployeesByPeopleRole(PEOPLE_ADMIN);
		employeeRoles.forEach(employeeRole -> notificationService.createNotification(employeeRole.getEmployee(), null,
				NotificationType.PASSWORD_RESET, EmailBodyTemplates.PEOPLE_MODULE_PASSWORD_RESET_REQUEST_MANAGER,
				notificationDynamicFields, NotificationCategory.PEOPLE));
	}

	private String getOrganizationName() {
		Optional<Organization> optionalOrganization = organizationDao.findTopByOrderByOrganizationIdDesc();
		if (optionalOrganization.isEmpty()) {
			return "";
		}
		return optionalOrganization.get().getOrganizationName();
	}

}
