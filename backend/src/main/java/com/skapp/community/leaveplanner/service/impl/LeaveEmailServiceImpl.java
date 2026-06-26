package com.skapp.community.leaveplanner.service.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.service.EmailService;
import com.skapp.community.common.type.EmailBodyTemplates;
import com.skapp.community.leaveplanner.model.LeaveEntitlement;
import com.skapp.community.leaveplanner.model.LeaveRequest;
import com.skapp.community.leaveplanner.payload.email.LeaveEmailDynamicFields;
import com.skapp.community.leaveplanner.service.LeaveEmailService;
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
public class LeaveEmailServiceImpl implements LeaveEmailService {

	private final EmailService emailService;

	private final EmployeeManagerDao employeeManagerDao;

	@Override
	public void sendApplyLeaveRequestEmployeeEmail(String firstName, String lastName, String userEmail,
			String leaveTypeName, LocalDate startDate, LocalDate endDate, String leaveState, String comment,
			boolean isSingleDay) {
		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();
		leaveEmailDynamicFields.setEmployeeOrManagerName(firstName + " " + lastName);
		leaveEmailDynamicFields.setLeaveType(leaveTypeName);
		leaveEmailDynamicFields.setLeaveStartDate(startDate.toString());
		leaveEmailDynamicFields.setLeaveEndDate(endDate.toString());
		leaveEmailDynamicFields.setLeaveDuration(leaveState);
		leaveEmailDynamicFields.setComment(comment);

		if (isSingleDay) {
			emailService.sendEmail(EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_APPLY_SINGLE_DAY_LEAVE,
					leaveEmailDynamicFields, userEmail);
		}
		else {
			emailService.sendEmail(EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_APPLY_MULTIPLE_DAY_LEAVE,
					leaveEmailDynamicFields, userEmail);
		}
	}

	@Override
	public void sendReceivedLeaveRequestManagerEmail(List<EmployeeManager> managers, String firstName, String lastName,
			String leaveState, String leaveTypeName, LocalDate startDate, LocalDate endDate, boolean isSingleDay) {
		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();

		leaveEmailDynamicFields.setEmployeeName(firstName + " " + lastName);
		leaveEmailDynamicFields.setLeaveDuration(leaveState);
		leaveEmailDynamicFields.setLeaveType(leaveTypeName);
		leaveEmailDynamicFields.setLeaveStartDate(startDate.toString());
		leaveEmailDynamicFields.setLeaveEndDate(endDate.toString());

		for (EmployeeManager manager : PeopleUtil.filterManagersByLeaveRoles(managers)) {
			leaveEmailDynamicFields.setEmployeeOrManagerName(
					manager.getManager().getFirstName() + " " + manager.getManager().getLastName());
			if (isSingleDay) {
				emailService.sendEmail(EmailBodyTemplates.LEAVE_MODULE_MANAGER_RECEIVED_SINGLE_DAY_LEAVE,
						leaveEmailDynamicFields, manager.getManager().getUser().getEmail());
			}
			else {
				emailService.sendEmail(EmailBodyTemplates.LEAVE_MODULE_MANAGER_RECEIVED_MULTIPLE_DAY_LEAVE,
						leaveEmailDynamicFields, manager.getManager().getUser().getEmail());
			}
		}
	}

	@Override
	public void sendCancelLeaveRequestEmployeeEmail(String userEmail, String firstName, String lastName,
			String leaveState, String leaveTypeName, LocalDate startDate, LocalDate endDate, boolean isSingleDay) {
		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();

		leaveEmailDynamicFields.setEmployeeOrManagerName(firstName + " " + lastName);
		leaveEmailDynamicFields.setLeaveDuration(leaveState);
		leaveEmailDynamicFields.setLeaveType(leaveTypeName);
		leaveEmailDynamicFields.setLeaveStartDate(startDate.toString());

		if (isSingleDay) {
			emailService.sendEmail(EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_CANCEL_SINGLE_DAY_LEAVE,
					leaveEmailDynamicFields, userEmail);
		}
		else {
			emailService.sendEmail(EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_CANCEL_MULTIPLE_DAY_LEAVE,
					leaveEmailDynamicFields, userEmail);
		}
	}

	@Override
	public void sendCancelLeaveRequestManagerEmail(List<EmployeeManager> managers, String firstName, String lastName,
			String leaveState, String leaveTypeName, LocalDate startDate, LocalDate endDate, boolean isSingleDay) {

		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();

		leaveEmailDynamicFields.setEmployeeName(firstName + " " + lastName);
		leaveEmailDynamicFields.setLeaveDuration(leaveState);
		leaveEmailDynamicFields.setLeaveType(leaveTypeName);
		leaveEmailDynamicFields.setLeaveStartDate(startDate.toString());
		leaveEmailDynamicFields.setLeaveEndDate(endDate.toString());

		for (EmployeeManager manager : PeopleUtil.filterManagersByLeaveRoles(managers)) {
			leaveEmailDynamicFields.setEmployeeOrManagerName(
					manager.getManager().getFirstName() + " " + manager.getManager().getLastName());
			if (isSingleDay) {
				emailService.sendEmail(EmailBodyTemplates.LEAVE_MODULE_MANAGER_CANCEL_SINGLE_DAY_LEAVE,
						leaveEmailDynamicFields, manager.getManager().getUser().getEmail());
			}
			else {
				emailService.sendEmail(EmailBodyTemplates.LEAVE_MODULE_MANAGER_CANCEL_MULTIPLE_DAY_LEAVE,
						leaveEmailDynamicFields, manager.getManager().getUser().getEmail());
			}
		}
	}

	@Override
	public void sendApprovedSingleDayLeaveRequestEmployeeEmail(LeaveRequest leaveRequest) {

		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();

		leaveEmailDynamicFields.setEmployeeOrManagerName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());
		leaveEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		leaveEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		leaveEmailDynamicFields.setLeaveDuration(String.valueOf(leaveRequest.getLeaveState()));
		leaveEmailDynamicFields
			.setManagerName(leaveRequest.getReviewer().getFirstName() + " " + leaveRequest.getReviewer().getLastName());

		emailService.sendEmail(EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_APPROVED_SINGLE_DAY_LEAVE,
				leaveEmailDynamicFields, leaveRequest.getEmployee().getUser().getEmail());
	}

	@Override
	public void sendApprovedMultiDayLeaveRequestEmployeeEmail(LeaveRequest leaveRequest) {

		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();

		leaveEmailDynamicFields.setEmployeeOrManagerName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());
		leaveEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		leaveEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		leaveEmailDynamicFields.setLeaveEndDate(leaveRequest.getEndDate().toString());
		leaveEmailDynamicFields.setLeaveDuration(String.valueOf(leaveRequest.getLeaveState()));
		leaveEmailDynamicFields
			.setManagerName(leaveRequest.getReviewer().getFirstName() + " " + leaveRequest.getReviewer().getLastName());
		leaveEmailDynamicFields.setComment(leaveRequest.getReviewerComment());

		emailService.sendEmail(EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_APPROVED_MULTI_DAY_LEAVE,
				leaveEmailDynamicFields, leaveRequest.getEmployee().getUser().getEmail());
	}

	@Override
	public void sendApprovedSingleDayLeaveRequestManagerEmail(LeaveRequest leaveRequest) {

		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();

		leaveEmailDynamicFields.setEmployeeName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());
		leaveEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		leaveEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		leaveEmailDynamicFields.setLeaveEndDate(leaveRequest.getEndDate().toString());
		leaveEmailDynamicFields.setLeaveDuration(String.valueOf(leaveRequest.getLeaveState()));
		leaveEmailDynamicFields.setComment(leaveRequest.getReviewerComment());

		List<EmployeeManager> otherManagers = getOtherManagers(
				employeeManagerDao.findByEmployee(leaveRequest.getEmployee()), leaveRequest.getReviewer().getUser());

		createLeaveEmailForManagers(otherManagers, leaveEmailDynamicFields,
				EmailBodyTemplates.LEAVE_MODULE_MANAGER_APPROVED_SINGLE_DAY_LEAVE);
	}

	@Override
	public void sendApprovedMultiDayLeaveRequestManagerEmail(LeaveRequest leaveRequest) {

		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();

		leaveEmailDynamicFields.setEmployeeName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());
		leaveEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		leaveEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		leaveEmailDynamicFields.setLeaveEndDate(leaveRequest.getEndDate().toString());
		leaveEmailDynamicFields.setLeaveDuration(String.valueOf(leaveRequest.getLeaveState()));
		leaveEmailDynamicFields
			.setManagerName(leaveRequest.getReviewer().getFirstName() + " " + leaveRequest.getReviewer().getLastName());
		leaveEmailDynamicFields.setComment(leaveRequest.getReviewerComment());

		List<EmployeeManager> otherManagers = getOtherManagers(
				employeeManagerDao.findByEmployee(leaveRequest.getEmployee()), leaveRequest.getReviewer().getUser());

		createLeaveEmailForManagers(otherManagers, leaveEmailDynamicFields,
				EmailBodyTemplates.LEAVE_MODULE_MANAGER_APPROVED_MULTI_DAY_LEAVE);
	}

	@Override
	public void sendRevokedSingleDayLeaveRequestEmployeeEmail(LeaveRequest leaveRequest) {

		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();

		leaveEmailDynamicFields.setEmployeeOrManagerName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());
		leaveEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		leaveEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		leaveEmailDynamicFields.setLeaveEndDate(leaveRequest.getEndDate().toString());
		leaveEmailDynamicFields.setLeaveDuration(String.valueOf(leaveRequest.getLeaveState()));
		leaveEmailDynamicFields
			.setManagerName(leaveRequest.getReviewer().getFirstName() + " " + leaveRequest.getReviewer().getLastName());
		leaveEmailDynamicFields.setComment(leaveRequest.getReviewerComment());

		emailService.sendEmail(EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_REVOKED_SINGLE_DAY_LEAVE,
				leaveEmailDynamicFields, leaveRequest.getEmployee().getUser().getEmail());
	}

	@Override
	public void sendRevokedMultiDayLeaveRequestEmployeeEmail(LeaveRequest leaveRequest) {

		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();

		leaveEmailDynamicFields.setEmployeeOrManagerName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());
		leaveEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		leaveEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		leaveEmailDynamicFields.setLeaveEndDate(leaveRequest.getEndDate().toString());
		leaveEmailDynamicFields.setLeaveDuration(String.valueOf(leaveRequest.getLeaveState()));
		leaveEmailDynamicFields
			.setManagerName(leaveRequest.getReviewer().getFirstName() + " " + leaveRequest.getReviewer().getLastName());
		leaveEmailDynamicFields.setComment(leaveRequest.getReviewerComment());

		emailService.sendEmail(EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_REVOKED_MULTI_DAY_LEAVE,
				leaveEmailDynamicFields, leaveRequest.getEmployee().getUser().getEmail());
	}

	@Override
	public void sendDeclinedSingleDayLeaveRequestEmployeeEmail(LeaveRequest leaveRequest) {

		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();

		leaveEmailDynamicFields.setEmployeeOrManagerName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());
		leaveEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		leaveEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		leaveEmailDynamicFields.setLeaveEndDate(leaveRequest.getEndDate().toString());
		leaveEmailDynamicFields.setLeaveDuration(String.valueOf(leaveRequest.getLeaveState()));
		leaveEmailDynamicFields
			.setManagerName(leaveRequest.getReviewer().getFirstName() + " " + leaveRequest.getReviewer().getLastName());
		leaveEmailDynamicFields.setComment(leaveRequest.getReviewerComment());

		emailService.sendEmail(EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_DECLINED_SINGLE_DAY_LEAVE,
				leaveEmailDynamicFields, leaveRequest.getEmployee().getUser().getEmail());
	}

	@Override
	public void sendDeclinedMultiDayLeaveRequestEmployeeEmail(LeaveRequest leaveRequest) {

		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();

		leaveEmailDynamicFields.setEmployeeOrManagerName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());
		leaveEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		leaveEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		leaveEmailDynamicFields.setLeaveEndDate(leaveRequest.getEndDate().toString());
		leaveEmailDynamicFields.setLeaveDuration(String.valueOf(leaveRequest.getLeaveState()));
		leaveEmailDynamicFields
			.setManagerName(leaveRequest.getReviewer().getFirstName() + " " + leaveRequest.getReviewer().getLastName());
		leaveEmailDynamicFields.setComment(leaveRequest.getReviewerComment());

		emailService.sendEmail(EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_DECLINED_MULTI_DAY_LEAVE,
				leaveEmailDynamicFields, leaveRequest.getEmployee().getUser().getEmail());
	}

	@Override
	public void sendRevokedSingleDayLeaveRequestManagerEmail(LeaveRequest leaveRequest) {

		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();

		leaveEmailDynamicFields.setEmployeeName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());
		leaveEmailDynamicFields
			.setManagerName(leaveRequest.getReviewer().getFirstName() + " " + leaveRequest.getReviewer().getLastName());
		leaveEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		leaveEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		leaveEmailDynamicFields.setLeaveEndDate(leaveRequest.getEndDate().toString());
		leaveEmailDynamicFields.setLeaveDuration(String.valueOf(leaveRequest.getLeaveState()));
		leaveEmailDynamicFields.setComment(leaveRequest.getReviewerComment());

		List<EmployeeManager> otherManagers = getOtherManagers(
				employeeManagerDao.findByEmployee(leaveRequest.getEmployee()), leaveRequest.getReviewer().getUser());

		createLeaveEmailForManagers(otherManagers, leaveEmailDynamicFields,
				EmailBodyTemplates.LEAVE_MODULE_MANAGER_REVOKED_SINGLE_DAY_LEAVE);
	}

	@Override
	public void sendRevokedMultiDayLeaveRequestManagerEmail(LeaveRequest leaveRequest) {

		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();

		leaveEmailDynamicFields.setEmployeeName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());
		leaveEmailDynamicFields
			.setManagerName(leaveRequest.getReviewer().getFirstName() + " " + leaveRequest.getReviewer().getLastName());
		leaveEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		leaveEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		leaveEmailDynamicFields.setLeaveEndDate(leaveRequest.getEndDate().toString());
		leaveEmailDynamicFields.setLeaveDuration(String.valueOf(leaveRequest.getLeaveState()));
		leaveEmailDynamicFields.setComment(leaveRequest.getReviewerComment());

		List<EmployeeManager> otherManagers = getOtherManagers(
				employeeManagerDao.findByEmployee(leaveRequest.getEmployee()), leaveRequest.getReviewer().getUser());

		createLeaveEmailForManagers(otherManagers, leaveEmailDynamicFields,
				EmailBodyTemplates.LEAVE_MODULE_MANAGER_REVOKED_MULTI_DAY_LEAVE);
	}

	@Override
	public void sendDeclinedSingleDayLeaveRequestManagerEmail(LeaveRequest leaveRequest) {

		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();

		leaveEmailDynamicFields.setEmployeeName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());
		leaveEmailDynamicFields
			.setManagerName(leaveRequest.getReviewer().getFirstName() + " " + leaveRequest.getReviewer().getLastName());
		leaveEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		leaveEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		leaveEmailDynamicFields.setLeaveEndDate(leaveRequest.getEndDate().toString());
		leaveEmailDynamicFields.setLeaveDuration(String.valueOf(leaveRequest.getLeaveState()));
		leaveEmailDynamicFields.setComment(leaveRequest.getReviewerComment());

		List<EmployeeManager> otherManagers = getOtherManagers(
				employeeManagerDao.findByEmployee(leaveRequest.getEmployee()), leaveRequest.getReviewer().getUser());

		createLeaveEmailForManagers(otherManagers, leaveEmailDynamicFields,
				EmailBodyTemplates.LEAVE_MODULE_MANAGER_DECLINED_SINGLE_DAY_LEAVE);
	}

	@Override
	public void sendDeclinedMultiDayLeaveRequestManagerEmail(LeaveRequest leaveRequest) {

		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();

		leaveEmailDynamicFields.setEmployeeName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());
		leaveEmailDynamicFields
			.setManagerName(leaveRequest.getReviewer().getFirstName() + " " + leaveRequest.getReviewer().getLastName());
		leaveEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		leaveEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		leaveEmailDynamicFields.setLeaveEndDate(leaveRequest.getEndDate().toString());
		leaveEmailDynamicFields.setLeaveDuration(String.valueOf(leaveRequest.getLeaveState()));
		leaveEmailDynamicFields.setComment(leaveRequest.getReviewerComment());

		List<EmployeeManager> otherManagers = getOtherManagers(
				employeeManagerDao.findByEmployee(leaveRequest.getEmployee()), leaveRequest.getReviewer().getUser());

		createLeaveEmailForManagers(otherManagers, leaveEmailDynamicFields,
				EmailBodyTemplates.LEAVE_MODULE_MANAGER_DECLINED_MULTI_DAY_LEAVE);
	}

	@Override
	public void sendNudgeSingleDayLeaveRequestManagerEmail(LeaveRequest leaveRequest) {
		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();

		leaveEmailDynamicFields.setEmployeeName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());
		leaveEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		leaveEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		leaveEmailDynamicFields.setLeaveDuration(String.valueOf(leaveRequest.getLeaveState()));
		leaveEmailDynamicFields.setComment(leaveRequest.getReviewerComment());

		List<EmployeeManager> managers = employeeManagerDao.findByEmployee(leaveRequest.getEmployee());

		createLeaveEmailForManagers(managers, leaveEmailDynamicFields,
				EmailBodyTemplates.LEAVE_MODULE_MANAGER_NUDGE_SINGLE_DAY_LEAVE);
	}

	@Override
	public void sendNudgeMultiDayLeaveRequestManagerEmail(LeaveRequest leaveRequest) {
		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();

		leaveEmailDynamicFields.setEmployeeName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());
		leaveEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		leaveEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		leaveEmailDynamicFields.setLeaveEndDate(leaveRequest.getEndDate().toString());
		leaveEmailDynamicFields.setLeaveDuration(String.valueOf(leaveRequest.getLeaveState()));
		leaveEmailDynamicFields.setComment(leaveRequest.getReviewerComment());

		List<EmployeeManager> managers = employeeManagerDao.findByEmployee(leaveRequest.getEmployee());

		createLeaveEmailForManagers(managers, leaveEmailDynamicFields,
				EmailBodyTemplates.LEAVE_MODULE_MANAGER_NUDGE_MULTI_DAY_LEAVE);
	}

	@Override
	public void sendAutoApprovedSingleDayLeaveRequestEmployeeEmail(LeaveRequest leaveRequest) {
		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();

		leaveEmailDynamicFields.setEmployeeOrManagerName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());
		leaveEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		leaveEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		leaveEmailDynamicFields.setLeaveDuration(String.valueOf(leaveRequest.getLeaveState()));

		emailService.sendEmail(EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_AUTO_APPROVED_SINGLE_DAY_LEAVE,
				leaveEmailDynamicFields, leaveRequest.getEmployee().getUser().getEmail());
	}

	@Override
	public void sendAutoApprovedMultiDayLeaveRequestEmployeeEmail(LeaveRequest leaveRequest) {
		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();

		leaveEmailDynamicFields.setEmployeeOrManagerName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());
		leaveEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		leaveEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		leaveEmailDynamicFields.setLeaveEndDate(leaveRequest.getEndDate().toString());
		leaveEmailDynamicFields.setLeaveDuration(String.valueOf(leaveRequest.getLeaveState()));
		leaveEmailDynamicFields.setComment(leaveRequest.getReviewerComment());

		emailService.sendEmail(EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_AUTO_APPROVED_MULTI_DAY_LEAVE,
				leaveEmailDynamicFields, leaveRequest.getEmployee().getUser().getEmail());
	}

	@Override
	public void sendAutoApprovedSingleDayLeaveRequestManagerEmail(LeaveRequest leaveRequest) {
		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();

		leaveEmailDynamicFields.setEmployeeName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());
		leaveEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		leaveEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		leaveEmailDynamicFields.setLeaveEndDate(leaveRequest.getEndDate().toString());
		leaveEmailDynamicFields.setLeaveDuration(String.valueOf(leaveRequest.getLeaveState()));
		leaveEmailDynamicFields.setComment(leaveRequest.getReviewerComment());

		List<EmployeeManager> managers = employeeManagerDao.findByEmployee(leaveRequest.getEmployee());

		createLeaveEmailForManagers(managers, leaveEmailDynamicFields,
				EmailBodyTemplates.LEAVE_MODULE_MANAGER_AUTO_APPROVED_SINGLE_DAY_LEAVE);
	}

	@Override
	public void sendAutoApprovedMultiDayLeaveRequestManagerEmail(LeaveRequest leaveRequest) {
		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();

		leaveEmailDynamicFields.setEmployeeName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());
		leaveEmailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		leaveEmailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		leaveEmailDynamicFields.setLeaveEndDate(leaveRequest.getEndDate().toString());
		leaveEmailDynamicFields.setLeaveDuration(String.valueOf(leaveRequest.getLeaveState()));
		leaveEmailDynamicFields.setComment(leaveRequest.getReviewerComment());

		List<EmployeeManager> managers = employeeManagerDao.findByEmployee(leaveRequest.getEmployee());

		createLeaveEmailForManagers(managers, leaveEmailDynamicFields,
				EmailBodyTemplates.LEAVE_MODULE_MANAGER_AUTO_APPROVED_MULTI_DAY_LEAVE);
	}

	@Override
	public void sendCustomAllocationEmployeeEmail(LeaveEntitlement leaveEntitlement) {
		LeaveEmailDynamicFields leaveEmailDynamicFields = new LeaveEmailDynamicFields();
		leaveEmailDynamicFields.setEmployeeOrManagerName(
				leaveEntitlement.getEmployee().getFirstName() + " " + leaveEntitlement.getEmployee().getLastName());
		leaveEmailDynamicFields.setLeaveType(leaveEntitlement.getLeaveType().getName());
		leaveEmailDynamicFields.setDuration(leaveEntitlement.getTotalDaysAllocated().toString());
		leaveEmailDynamicFields.setValidFrom(leaveEntitlement.getValidFrom().toString());
		leaveEmailDynamicFields.setValidTo(leaveEntitlement.getValidTo().toString());

		emailService.sendEmail(EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_CUSTOM_ALLOCATION, leaveEmailDynamicFields,
				leaveEntitlement.getEmployee().getUser().getEmail());
	}

	private List<EmployeeManager> getOtherManagers(List<EmployeeManager> allManagers, User currentManager) {
		return allManagers.stream()
			.filter(manager -> !manager.getManager().getUser().getUserId().equals(currentManager.getUserId()))
			.toList();
	}

	private void createLeaveEmailForManagers(List<EmployeeManager> managers,
			LeaveEmailDynamicFields leaveEmailDynamicFields, EmailBodyTemplates emailBodyTemplates) {
		PeopleUtil.filterManagersByLeaveRoles(managers).forEach(manager -> {
			leaveEmailDynamicFields.setEmployeeOrManagerName(
					manager.getManager().getFirstName() + " " + manager.getManager().getLastName());
			emailService.sendEmail(emailBodyTemplates, leaveEmailDynamicFields,
					manager.getManager().getUser().getEmail());
		});
	}

}
