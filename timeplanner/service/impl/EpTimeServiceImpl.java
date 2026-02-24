package com.skapp.enterprise.timeplanner.service.impl;

import com.skapp.community.common.mapper.CommonMapper;
import com.skapp.community.common.service.OrganizationService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.common.util.transformer.PageTransformer;
import com.skapp.community.leaveplanner.mapper.LeaveMapper;
import com.skapp.community.leaveplanner.model.LeaveRequest;
import com.skapp.community.leaveplanner.repository.LeaveEntitlementDao;
import com.skapp.community.leaveplanner.repository.LeaveRequestDao;
import com.skapp.community.leaveplanner.repository.LeaveRequestEntitlementDao;
import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import com.skapp.community.peopleplanner.mapper.PeopleMapper;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.repository.EmployeeManagerDao;
import com.skapp.community.peopleplanner.repository.HolidayDao;
import com.skapp.community.peopleplanner.repository.TeamDao;
import com.skapp.community.timeplanner.mapper.TimeMapper;
import com.skapp.community.timeplanner.repository.TimeConfigDao;
import com.skapp.community.timeplanner.repository.TimeRecordDao;
import com.skapp.community.timeplanner.repository.TimeRequestDao;
import com.skapp.community.timeplanner.repository.TimeSlotDao;
import com.skapp.community.timeplanner.service.AttendanceConfigService;
import com.skapp.community.timeplanner.service.AttendanceNotificationService;
import com.skapp.community.timeplanner.service.TimeEmailService;
import com.skapp.community.timeplanner.service.impl.TimeServiceImpl;
import com.skapp.enterprise.leaveplanner.service.EpLeaveCalendarService;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import tools.jackson.databind.json.JsonMapper;

@Primary
@Service
public class EpTimeServiceImpl extends TimeServiceImpl {

	private final EpLeaveCalendarService epLeaveCalendarService;

	public EpTimeServiceImpl(TimeConfigDao timeConfigDao, JsonMapper mapper, MessageUtil messageUtil,
			UserService userService, TimeRecordDao timeRecordDao, TimeSlotDao timeSlotDao,
			AttendanceConfigService attendanceConfigService, LeaveRequestDao leaveRequestDao, HolidayDao holidayDao,
			EmployeeDao employeeDao, PeopleMapper peopleMapper, LeaveMapper leaveMapper, TimeRequestDao timeRequestDao,
			TeamDao teamDao, TimeMapper timeMapper, CommonMapper commonMapper, TimeEmailService timeEmailService,
			PageTransformer pageTransformer, EmployeeManagerDao employeeManagerDao,
			AttendanceNotificationService attendanceNotificationService,
			LeaveRequestEntitlementDao leaveRequestEntitlementDao, LeaveEntitlementDao leaveEntitlementDao,
			OrganizationService organizationService, EpLeaveCalendarService epLeaveCalendarService) {
		super(timeConfigDao, mapper, messageUtil, userService, timeRecordDao, timeSlotDao, attendanceConfigService,
				leaveRequestDao, holidayDao, employeeDao, peopleMapper, leaveMapper, timeRequestDao, teamDao,
				timeMapper, commonMapper, timeEmailService, pageTransformer, employeeManagerDao,
				attendanceNotificationService, leaveRequestEntitlementDao, leaveEntitlementDao, organizationService);
		this.epLeaveCalendarService = epLeaveCalendarService;
	}

	@Override
	protected void handleCalendarEventsDeletion(LeaveRequest leaveRequest) {
		if (leaveRequest != null && (leaveRequest.getStatus().equals(LeaveRequestStatus.DENIED)
				|| leaveRequest.getStatus().equals(LeaveRequestStatus.REVOKED)
				|| leaveRequest.getStatus().equals(LeaveRequestStatus.CANCELLED))) {
			epLeaveCalendarService.deleteOutOfOfficeEventsForLeave(leaveRequest);
		}
	}

}
