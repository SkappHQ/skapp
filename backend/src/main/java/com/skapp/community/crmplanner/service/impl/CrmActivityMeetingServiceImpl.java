package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.TimeZoneService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.crmplanner.payload.request.CrmActivityMeetingFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityMeetingResponseDto;
import com.skapp.community.crmplanner.repository.CrmActivityMeetingDao;
import com.skapp.community.crmplanner.service.CrmActivityMeetingService;
import com.skapp.community.crmplanner.util.CrmUtil;
import com.skapp.community.crmplanner.util.CrmValidations;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmActivityMeetingServiceImpl implements CrmActivityMeetingService {

	private final CrmActivityMeetingDao crmActivityMeetingDao;

	private final UserService userService;

	private final TimeZoneService timeZoneService;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getMeetings(CrmActivityMeetingFilterDto filterDto) {
		log.info("getMeetings: execution started");

		User currentUser = userService.getCurrentUser();
		CrmValidations.validateActivityDateRange(filterDto.getStartDate(), filterDto.getEndDate());

		List<CrmActivityMeetingResponseDto> meetings = crmActivityMeetingDao.findMeetings(filterDto,
				currentUser.getEmployee().getEmployeeId(), CrmUtil.isCrmSalesRepresentative(currentUser),
				timeZoneService.requestTimezone());

		log.info("getMeetings: execution ended");
		return new ResponseEntityDto(false, meetings);
	}

}
