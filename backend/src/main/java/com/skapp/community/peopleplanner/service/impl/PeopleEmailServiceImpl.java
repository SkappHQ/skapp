package com.skapp.community.peopleplanner.service.impl;

import com.skapp.community.common.model.Organization;
import com.skapp.community.common.model.User;
import com.skapp.community.common.repository.OrganizationDao;
import com.skapp.community.common.repository.UserDao;
import com.skapp.community.common.service.EmailService;
import com.skapp.community.common.service.EncryptionDecryptionService;
import com.skapp.community.common.type.EmailBodyTemplates;
import com.skapp.community.common.type.LoginMethod;
import com.skapp.community.leaveplanner.model.LeaveRequest;
import com.skapp.community.peopleplanner.model.EmployeeManager;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.model.Holiday;
import com.skapp.community.peopleplanner.payload.email.PeopleEmailDynamicFields;
import com.skapp.community.peopleplanner.repository.EmployeeManagerDao;
import com.skapp.community.peopleplanner.repository.EmployeeRoleDao;
import com.skapp.community.peopleplanner.service.PeopleEmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static com.skapp.community.common.type.Role.PEOPLE_ADMIN;

@Service
@Slf4j
@RequiredArgsConstructor
public class PeopleEmailServiceImpl implements PeopleEmailService {

	private final EmailService emailService;

	private final OrganizationDao organizationDao;

	private final UserDao userDao;

	private final EmployeeManagerDao employeeManagerDao;

	private final EmployeeRoleDao employeeRoleDao;

	private final EncryptionDecryptionService encryptionDecryptionService;

	@Value("${encryptDecryptAlgorithm.secret}")
	private String secretKey;

	@Override
	public void sendUserInvitationEmail(User user) {
		PeopleEmailDynamicFields emailDynamicFields = new PeopleEmailDynamicFields();
		emailDynamicFields
			.setEmployeeOrManagerName(user.getEmployee().getFirstName() + " " + user.getEmployee().getLastName());
		emailDynamicFields.setOrganizationName(getOrganizationName());
		emailDynamicFields.setWorkEmail(user.getEmail());
		emailDynamicFields.setTemporaryPassword(encryptionDecryptionService.decrypt(user.getTempPassword(), secretKey));

		if (user.getLoginMethod() == LoginMethod.GOOGLE) {
			emailService.sendEmail(EmailBodyTemplates.PEOPLE_MODULE_USER_INVITATION_GOOGLE_SSO, emailDynamicFields,
					emailDynamicFields.getWorkEmail());
		}

		else if (user.getLoginMethod() == LoginMethod.MICROSOFT) {
			emailService.sendEmail(EmailBodyTemplates.PEOPLE_MODULE_USER_INVITATION_MICROSOFT_SSO, emailDynamicFields,
					emailDynamicFields.getWorkEmail());
		}

		else if (user.getLoginMethod() == LoginMethod.CREDENTIALS) {
			emailService.sendEmail(EmailBodyTemplates.PEOPLE_MODULE_USER_INVITATION_V1, emailDynamicFields,
					emailDynamicFields.getWorkEmail());
		}

	}

	@Override
	public void sendUserTerminationEmail(User user) {
		PeopleEmailDynamicFields emailDynamicFields = new PeopleEmailDynamicFields();
		emailDynamicFields
			.setEmployeeOrManagerName(user.getEmployee().getFirstName() + " " + user.getEmployee().getLastName());
		emailDynamicFields.setOrganizationName(getOrganizationName());
		emailDynamicFields.setTerminationDate(user.getEmployee().getTerminationDate().toString());

		emailService.sendEmail(EmailBodyTemplates.PEOPLE_MODULE_USER_TERMINATION_V1, emailDynamicFields,
				emailDynamicFields.getWorkEmail());
	}

	@Override
	public void sendNewHolidayDeclarationEmail(Holiday holiday) {
		PeopleEmailDynamicFields emailDynamicFields = new PeopleEmailDynamicFields();
		emailDynamicFields.setOrganizationName(getOrganizationName());
		emailDynamicFields.setHolidayDate(holiday.getDate().toString());
		emailDynamicFields.setHolidayName(holiday.getName());

		List<User> users = userDao.findAllByIsActiveTrue();
		users.forEach(user -> {
			emailDynamicFields
				.setEmployeeOrManagerName(user.getEmployee().getFirstName() + " " + user.getEmployee().getLastName());
			emailService.sendEmail(EmailBodyTemplates.PEOPLE_MODULE_NEW_HOLIDAY_DECLARED, emailDynamicFields,
					user.getEmail());
		});

	}

	@Override
	public void sendHolidaySingleDayPendingLeaveRequestCancellationEmployeeEmail(LeaveRequest leaveRequest,
			Holiday holiday) {
		PeopleEmailDynamicFields emailDynamicFields = new PeopleEmailDynamicFields();
		emailDynamicFields.setEmployeeOrManagerName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());
		emailDynamicFields.setOrganizationName(getOrganizationName());
		emailDynamicFields.setLeaveDuration(String.valueOf(leaveRequest.getLeaveState()));
		emailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		emailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		emailDynamicFields.setHolidayDate(holiday.getDate().toString());
		emailDynamicFields.setHolidayName(holiday.getName());

		emailService.sendEmail(
				EmailBodyTemplates.PEOPLE_MODULE_HOLIDAY_SINGLE_DAY_PENDING_LEAVE_REQUEST_CANCELED_EMPLOYEE,
				emailDynamicFields, leaveRequest.getEmployee().getUser().getEmail());
	}

	@Override
	public void sendHolidayMultipleDayPendingLeaveRequestUpdatedEmployeeEmail(LeaveRequest leaveRequest,
			Holiday holiday) {
		PeopleEmailDynamicFields emailDynamicFields = new PeopleEmailDynamicFields();
		emailDynamicFields.setEmployeeOrManagerName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());
		emailDynamicFields.setOrganizationName(getOrganizationName());
		emailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		emailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		emailDynamicFields.setLeaveEndDate(leaveRequest.getEndDate().toString());
		emailDynamicFields.setHolidayDate(holiday.getDate().toString());
		emailDynamicFields.setHolidayName(holiday.getName());

		emailService.sendEmail(
				EmailBodyTemplates.PEOPLE_MODULE_HOLIDAY_MULTI_DAY_PENDING_LEAVE_REQUEST_UPDATED_EMPLOYEE,
				emailDynamicFields, leaveRequest.getEmployee().getUser().getEmail());
	}

	@Override
	public void sendHolidaySingleDayApprovedLeaveRequestRevokedEmployeeEmail(LeaveRequest leaveRequest,
			Holiday holiday) {
		PeopleEmailDynamicFields emailDynamicFields = new PeopleEmailDynamicFields();
		emailDynamicFields.setEmployeeOrManagerName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());
		emailDynamicFields.setOrganizationName(getOrganizationName());
		emailDynamicFields.setLeaveDuration(String.valueOf(leaveRequest.getLeaveState()));
		emailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		emailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		emailDynamicFields.setHolidayDate(holiday.getDate().toString());
		emailDynamicFields.setHolidayName(holiday.getName());

		emailService.sendEmail(
				EmailBodyTemplates.PEOPLE_MODULE_HOLIDAY_SINGLE_DAY_APPROVED_LEAVE_REQUEST_REVOKED_EMPLOYEE,
				emailDynamicFields, leaveRequest.getEmployee().getUser().getEmail());
	}

	@Override
	public void sendHolidayMultipleDayApprovedLeaveRequestUpdatedEmployeeEmail(LeaveRequest leaveRequest,
			Holiday holiday) {
		PeopleEmailDynamicFields emailDynamicFields = new PeopleEmailDynamicFields();
		emailDynamicFields.setEmployeeOrManagerName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());
		emailDynamicFields.setOrganizationName(getOrganizationName());
		emailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		emailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		emailDynamicFields.setLeaveEndDate(leaveRequest.getEndDate().toString());
		emailDynamicFields.setHolidayDate(holiday.getDate().toString());
		emailDynamicFields.setHolidayName(holiday.getName());
		emailDynamicFields.setRevisedDuration(leaveRequest.getDurationDays().toString());

		emailService.sendEmail(
				EmailBodyTemplates.PEOPLE_MODULE_HOLIDAY_MULTI_DAY_APPROVED_LEAVE_REQUEST_UPDATED_EMPLOYEE,
				emailDynamicFields, leaveRequest.getEmployee().getUser().getEmail());
	}

	@Override
	public void sendHolidayMultipleDayApprovedLeaveRequestUpdatedManagerEmail(LeaveRequest leaveRequest,
			Holiday holiday) {
		PeopleEmailDynamicFields emailDynamicFields = new PeopleEmailDynamicFields();
		emailDynamicFields.setOrganizationName(getOrganizationName());
		emailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		emailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		emailDynamicFields.setLeaveEndDate(leaveRequest.getEndDate().toString());
		emailDynamicFields.setHolidayDate(holiday.getDate().toString());
		emailDynamicFields.setHolidayName(holiday.getName());
		emailDynamicFields.setRevisedDuration(leaveRequest.getDurationDays().toString());
		emailDynamicFields.setEmployeeName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());

		List<EmployeeManager> managers = employeeManagerDao.findByEmployee(leaveRequest.getEmployee());
		managers.forEach(employeeManager -> {
			emailDynamicFields.setEmployeeOrManagerName(
					employeeManager.getManager().getFirstName() + " " + employeeManager.getManager().getLastName());
			emailService.sendEmail(
					EmailBodyTemplates.PEOPLE_MODULE_HOLIDAY_MULTI_DAY_APPROVED_LEAVE_REQUEST_UPDATED_MANAGER,
					emailDynamicFields, employeeManager.getManager().getUser().getEmail());
		});
	}

	@Override
	public void sendHolidayMultipleDayPendingLeaveRequestUpdatedManagerEmail(LeaveRequest leaveRequest,
			Holiday holiday) {
		PeopleEmailDynamicFields emailDynamicFields = new PeopleEmailDynamicFields();
		emailDynamicFields.setOrganizationName(getOrganizationName());
		emailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		emailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		emailDynamicFields.setLeaveEndDate(leaveRequest.getEndDate().toString());
		emailDynamicFields.setHolidayDate(holiday.getDate().toString());
		emailDynamicFields.setHolidayName(holiday.getName());
		emailDynamicFields.setEmployeeName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());
		emailDynamicFields.setRevisedDuration(leaveRequest.getDurationDays().toString());

		List<EmployeeManager> managers = employeeManagerDao.findByEmployee(leaveRequest.getEmployee());
		managers.forEach(employeeManager -> {
			emailDynamicFields.setEmployeeOrManagerName(
					employeeManager.getManager().getFirstName() + " " + employeeManager.getManager().getLastName());
			emailService.sendEmail(
					EmailBodyTemplates.PEOPLE_MODULE_HOLIDAY_DAY_MULTI_DAY_PENDING_LEAVE_REQUEST_UPDATED_MANAGER,
					emailDynamicFields, employeeManager.getManager().getUser().getEmail());
		});
	}

	@Override
	public void sendHolidaySingleDayPendingLeaveRequestCancellationManagerEmail(LeaveRequest leaveRequest,
			Holiday holiday) {
		PeopleEmailDynamicFields emailDynamicFields = new PeopleEmailDynamicFields();
		emailDynamicFields.setOrganizationName(getOrganizationName());
		emailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		emailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		emailDynamicFields.setHolidayDate(holiday.getDate().toString());
		emailDynamicFields.setHolidayName(holiday.getName());
		emailDynamicFields.setEmployeeName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());

		Set<EmployeeManager> employeeManagers = leaveRequest.getEmployee().getEmployeeManagers();
		employeeManagers.forEach(employeeManager -> {
			emailDynamicFields.setEmployeeOrManagerName(
					employeeManager.getManager().getFirstName() + " " + employeeManager.getManager().getLastName());
			emailService.sendEmail(
					EmailBodyTemplates.PEOPLE_MODULE_HOLIDAY_SINGLE_DAY_PENDING_LEAVE_REQUEST_CANCELED_MANAGER,
					emailDynamicFields, employeeManager.getManager().getUser().getEmail());
		});
	}

	@Override
	public void sendHolidaySingleDayApprovedLeaveRequestRevokedManagerEmail(LeaveRequest leaveRequest,
			Holiday holiday) {
		PeopleEmailDynamicFields emailDynamicFields = new PeopleEmailDynamicFields();
		emailDynamicFields.setOrganizationName(getOrganizationName());
		emailDynamicFields.setLeaveDuration(String.valueOf(leaveRequest.getLeaveState()));
		emailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		emailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		emailDynamicFields.setHolidayDate(holiday.getDate().toString());
		emailDynamicFields.setHolidayName(holiday.getName());
		emailDynamicFields.setEmployeeName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());

		Set<EmployeeManager> employeeManagers = leaveRequest.getEmployee().getEmployeeManagers();
		employeeManagers.forEach(employeeManager -> {
			emailDynamicFields.setEmployeeOrManagerName(
					employeeManager.getManager().getFirstName() + " " + employeeManager.getManager().getLastName());
			emailService.sendEmail(
					EmailBodyTemplates.PEOPLE_MODULE_HOLIDAY_DAY_SINGLE_DAY_APPROVED_LEAVE_REQUEST_REVOKED_MANAGER,
					emailDynamicFields, employeeManager.getManager().getUser().getEmail());
		});
	}

	@Override
	public void sendPasswordResetRequestManagerEmail(User user, String requestDateTime) {
		PeopleEmailDynamicFields emailDynamicFields = new PeopleEmailDynamicFields();
		emailDynamicFields.setRequestDateTime(requestDateTime);
		emailDynamicFields.setEmployeeName(user.getEmployee().getFirstName() + " " + user.getEmployee().getLastName());
		emailDynamicFields.setWorkEmail(user.getEmail());

		List<EmployeeRole> employeeRoles = employeeRoleDao.findEmployeesByPeopleRole(PEOPLE_ADMIN);
		employeeRoles.forEach(employeeRole -> {
			emailDynamicFields.setEmployeeOrManagerName(
					employeeRole.getEmployee().getFirstName() + " " + employeeRole.getEmployee().getLastName());
			emailService.sendEmail(EmailBodyTemplates.PEOPLE_MODULE_PASSWORD_RESET_REQUEST_MANAGER, emailDynamicFields,
					employeeRole.getEmployee().getUser().getEmail());
		});
	}

	private String getOrganizationName() {
		Optional<Organization> optionalOrganization = organizationDao.findTopByOrderByOrganizationIdDesc();
		if (optionalOrganization.isEmpty()) {
			return "";
		}
		return optionalOrganization.get().getOrganizationName();
	}

}
