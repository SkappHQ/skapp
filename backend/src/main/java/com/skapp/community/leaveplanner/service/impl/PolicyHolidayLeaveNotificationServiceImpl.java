package com.skapp.community.leaveplanner.service.impl;

import com.skapp.community.common.service.NotificationService;
import com.skapp.community.common.type.EmailBodyTemplates;
import com.skapp.community.common.type.NotificationCategory;
import com.skapp.community.common.type.NotificationType;
import com.skapp.community.leaveplanner.model.PolicyLeaveRequest;
import com.skapp.community.leaveplanner.service.PolicyHolidayLeaveNotificationService;
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
	public void sendHolidayLeaveRequestNotifications(PolicyLeaveRequest policyLeaveRequest, Holiday holiday,
			EmailBodyTemplates employeeTemplate, EmailBodyTemplates managerTemplate) {
		log.info("sendHolidayLeaveRequestNotifications: execution started");

		PeopleEmailDynamicFields dynamicFields = new PeopleEmailDynamicFields();
		dynamicFields.setEmployeeName(policyLeaveRequest.getEmployee().getFullName());
		dynamicFields.setLeaveStartDate(policyLeaveRequest.getStartDate().toString());
		dynamicFields.setLeaveEndDate(policyLeaveRequest.getEndDate().toString());
		String holidayId = holiday.getId().toString();

		notificationService.createNotification(policyLeaveRequest.getEmployee(), holidayId, NotificationType.HOLIDAY,
				employeeTemplate, dynamicFields, NotificationCategory.PEOPLE);

		PeopleUtil.filterManagersByLeaveRoles(employeeManagerDao.findByEmployee(policyLeaveRequest.getEmployee()))
			.forEach(manager -> notificationService.createNotification(manager.getManager(), holidayId,
					NotificationType.HOLIDAY, managerTemplate, dynamicFields, NotificationCategory.PEOPLE));

		log.info("sendHolidayLeaveRequestNotifications: execution ended");
	}

}
