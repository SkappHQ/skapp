package com.skapp.enterprise.leaveplanner.service.impl;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.repository.NotificationDao;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.common.util.transformer.PageTransformer;
import com.skapp.community.leaveplanner.mapper.LeaveMapper;
import com.skapp.community.leaveplanner.model.LeaveRequest;
import com.skapp.community.leaveplanner.payload.LeaveRequestManagerUpdateDto;
import com.skapp.community.leaveplanner.repository.LeaveEntitlementDao;
import com.skapp.community.leaveplanner.repository.LeaveRequestDao;
import com.skapp.community.leaveplanner.repository.LeaveRequestEntitlementDao;
import com.skapp.community.leaveplanner.repository.LeaveTypeDao;
import com.skapp.community.leaveplanner.service.LeaveEmailService;
import com.skapp.community.leaveplanner.service.LeaveNotificationService;
import com.skapp.community.leaveplanner.service.impl.LeaveServiceImpl;
import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import com.skapp.community.peopleplanner.mapper.PeopleMapper;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.repository.EmployeeManagerDao;
import com.skapp.community.peopleplanner.repository.EmployeeTeamDao;
import com.skapp.community.peopleplanner.repository.HolidayDao;
import com.skapp.community.peopleplanner.repository.TeamDao;
import com.skapp.community.peopleplanner.service.PeopleService;
import com.skapp.community.timeplanner.repository.TimeConfigDao;
import com.skapp.enterprise.leaveplanner.service.EpLeaveCalendarService;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@Primary
public class EpLeaveServiceImpl extends LeaveServiceImpl {

	private final EpLeaveCalendarService epLeaveCalendarService;

	private final LeaveRequestDao leaveRequestDao;

	public EpLeaveServiceImpl(@NonNull UserService userService, @NonNull LeaveMapper leaveMapper,
			@NonNull LeaveTypeDao leaveTypeDao, @NonNull MessageUtil messageUtil,
			@NonNull LeaveEntitlementDao leaveEntitlementDao,
			@NonNull LeaveRequestEntitlementDao leaveRequestEntitlementDao, @NonNull TimeConfigDao timeConfigDao,
			@NonNull HolidayDao holidayDao, @NonNull EmployeeDao employeeDao,
			@NonNull EmployeeManagerDao employeeManagerDao, @NonNull PageTransformer pageTransformer,
			@NonNull PeopleService peopleService, @NonNull TeamDao teamDao, @NonNull PeopleMapper peopleMapper,
			@NonNull EmployeeTeamDao employeeTeamDao, @NonNull LeaveEmailService leaveEmailService,
			@NonNull LeaveNotificationService leaveNotificationService, @NonNull NotificationDao notificationDao,
			EpLeaveCalendarService epLeaveCalendarService, LeaveRequestDao leaveRequestDao) {
		super(userService, leaveMapper, leaveRequestDao, leaveTypeDao, messageUtil, leaveEntitlementDao,
				leaveRequestEntitlementDao, timeConfigDao, holidayDao, employeeDao, employeeManagerDao, pageTransformer,
				peopleService, teamDao, peopleMapper, employeeTeamDao, leaveEmailService, leaveNotificationService,
				notificationDao);
		this.epLeaveCalendarService = epLeaveCalendarService;
		this.leaveRequestDao = leaveRequestDao;
	}

	@Override
	public ResponseEntityDto updateLeaveRequestByManager(Long id, @NonNull LeaveRequestManagerUpdateDto updateDto,
			boolean isInvokedByManager) {
		ResponseEntityDto responseEntityDto = super.updateLeaveRequestByManager(id, updateDto, isInvokedByManager);
		deleteOutOfOfficeEvent(id);
		return responseEntityDto;
	}

	@Override
	@Transactional
	public ResponseEntityDto deleteLeaveRequestById(@NonNull Long id) {
		ResponseEntityDto responseEntityDto = super.deleteLeaveRequestById(id);
		deleteOutOfOfficeEvent(id);
		return responseEntityDto;
	}

	private void deleteOutOfOfficeEvent(Long id) {
		LeaveRequest leaveRequest = leaveRequestDao.findById(id).orElse(null);

		if (leaveRequest != null && (leaveRequest.getStatus().equals(LeaveRequestStatus.DENIED)
				|| leaveRequest.getStatus().equals(LeaveRequestStatus.REVOKED)
				|| leaveRequest.getStatus().equals(LeaveRequestStatus.CANCELLED))) {

			epLeaveCalendarService.deleteOutOfOfficeEventsForLeave(leaveRequest);
		}
	}

}
