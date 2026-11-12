package com.skapp.community.leaveplanner.service.impl;

import com.skapp.community.common.service.NotificationService;
import com.skapp.community.common.type.EmailBodyTemplates;
import com.skapp.community.common.type.NotificationCategory;
import com.skapp.community.common.type.NotificationType;
import com.skapp.community.leaveplanner.model.PolicyLeaveRequest;
import com.skapp.community.leaveplanner.service.PolicyHolidayLeaveNotificationService;
import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import com.skapp.community.peopleplanner.model.Holiday;
import com.skapp.community.peopleplanner.payload.email.PeopleEmailDynamicFields;
import com.skapp.community.peopleplanner.repository.EmployeeManagerDao;
import com.skapp.community.peopleplanner.util.PeopleUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class PolicyHolidayLeaveNotificationServiceImpl implements PolicyHolidayLeaveNotificationService {

	private final NotificationService notificationService;

	private final EmployeeManagerDao employeeManagerDao;

	@Override
	public void sendHolidayLeaveRequestVoidedNotifications(PolicyLeaveRequest policyLeaveRequest, Holiday holiday,
			LeaveRequestStatus originalStatus) {
		boolean wasPending = originalStatus == LeaveRequestStatus.PENDING;

		createEmployeeNotification(policyLeaveRequest, holiday,
				wasPending ? EmailBodyTemplates.PEOPLE_MODULE_HOLIDAY_SINGLE_DAY_PENDING_LEAVE_REQUEST_CANCELED_EMPLOYEE
						: EmailBodyTemplates.PEOPLE_MODULE_HOLIDAY_SINGLE_DAY_APPROVED_LEAVE_REQUEST_REVOKED_EMPLOYEE);

		createManagerNotifications(policyLeaveRequest, holiday, wasPending
				? EmailBodyTemplates.PEOPLE_MODULE_HOLIDAY_SINGLE_DAY_PENDING_LEAVE_REQUEST_CANCELED_MANAGER
				: EmailBodyTemplates.PEOPLE_MODULE_HOLIDAY_DAY_SINGLE_DAY_APPROVED_LEAVE_REQUEST_REVOKED_MANAGER);
	}

	@Override
	public void sendHolidayLeaveRequestUpdatedNotifications(PolicyLeaveRequest policyLeaveRequest, Holiday holiday) {
		boolean isPending = policyLeaveRequest.getStatus() == LeaveRequestStatus.PENDING;

		createEmployeeNotification(policyLeaveRequest, holiday,
				isPending ? EmailBodyTemplates.PEOPLE_MODULE_HOLIDAY_MULTI_DAY_PENDING_LEAVE_REQUEST_UPDATED_EMPLOYEE
						: EmailBodyTemplates.PEOPLE_MODULE_HOLIDAY_MULTI_DAY_APPROVED_LEAVE_REQUEST_UPDATED_EMPLOYEE);

		createManagerNotifications(policyLeaveRequest, holiday,
				isPending ? EmailBodyTemplates.PEOPLE_MODULE_HOLIDAY_DAY_MULTI_DAY_PENDING_LEAVE_REQUEST_UPDATED_MANAGER
						: EmailBodyTemplates.PEOPLE_MODULE_HOLIDAY_MULTI_DAY_APPROVED_LEAVE_REQUEST_UPDATED_MANAGER);
	}

	private PeopleEmailDynamicFields buildDynamicFields(PolicyLeaveRequest policyLeaveRequest) {
		PeopleEmailDynamicFields dynamicFields = new PeopleEmailDynamicFields();
		dynamicFields.setEmployeeName(policyLeaveRequest.getEmployee().getFullName());
		dynamicFields.setLeaveStartDate(policyLeaveRequest.getStartDate().toString());
		dynamicFields.setLeaveEndDate(policyLeaveRequest.getEndDate().toString());
		return dynamicFields;
	}

	private void createEmployeeNotification(PolicyLeaveRequest policyLeaveRequest, Holiday holiday,
			EmailBodyTemplates template) {
		notificationService.createNotification(policyLeaveRequest.getEmployee(), holiday.getId().toString(),
				NotificationType.HOLIDAY, template, buildDynamicFields(policyLeaveRequest),
				NotificationCategory.PEOPLE);
	}

	private void createManagerNotifications(PolicyLeaveRequest policyLeaveRequest, Holiday holiday,
			EmailBodyTemplates template) {
		PeopleEmailDynamicFields dynamicFields = buildDynamicFields(policyLeaveRequest);
		PeopleUtil.filterManagersByLeaveRoles(employeeManagerDao.findByEmployee(policyLeaveRequest.getEmployee()))
			.forEach(manager -> notificationService.createNotification(manager.getManager(), holiday.getId().toString(),
					NotificationType.HOLIDAY, template, dynamicFields, NotificationCategory.PEOPLE));
	}

}
