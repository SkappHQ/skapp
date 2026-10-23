package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.TimeZoneService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.crmplanner.payload.request.CrmActivityMeetingFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityMeetingResponseDto;
import com.skapp.community.crmplanner.repository.CrmActivityMeetingDao;
import com.skapp.community.crmplanner.service.CrmActivityMeetingService;
import com.skapp.community.crmplanner.type.CrmActivityMeetingFilterParams;
import com.skapp.community.crmplanner.type.CrmActivityMeetingSort;
import com.skapp.community.crmplanner.util.CrmUtil;
import com.skapp.community.crmplanner.util.CrmValidations;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.util.List;
import java.util.Map;

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
		CrmActivityMeetingSort sortKey = filterDto.getSortKey() != null ? filterDto.getSortKey()
				: CrmActivityMeetingSort.START_AT;

		CrmActivityMeetingFilterParams params = new CrmActivityMeetingFilterParams();
		params.setSortKey(sortKey);
		boolean isRepresentative = CrmUtil.isCrmSalesRepresentative(currentUser);
		params.setCurrentEmployeeId(currentUser.getEmployee().getEmployeeId());
		params.setIsRestrictedToOwner(isRepresentative);

		CrmValidations.validateActivityDateRange(filterDto.getStartDate(), filterDto.getEndDate());

		params.setOwnerId(filterDto.getOwnerId());
		params.setSearchPattern(CrmUtil.toSearchPattern(filterDto.getSearchKeyword()));
		Sort.Direction defaultSortOrder = sortKey == CrmActivityMeetingSort.OWNER ? Sort.Direction.ASC
				: Sort.Direction.DESC;
		params.setSortOrder(filterDto.getSortOrder() != null ? filterDto.getSortOrder() : defaultSortOrder);

		ZoneId zone = timeZoneService.requestTimezone();
		if (filterDto.getStartDate() != null) {
			params.setRangeStart(filterDto.getStartDate().atStartOfDay(zone).toInstant());
		}
		if (filterDto.getEndDate() != null) {
			params.setRangeEnd(filterDto.getEndDate().plusDays(1).atStartOfDay(zone).toInstant());
		}

		List<CrmActivityMeetingResponseDto> meetings = crmActivityMeetingDao.findMeetings(params);

		Map<Long, List<Long>> contactIdsByMeeting = crmActivityMeetingDao
			.findContactIdsByMeetingIds(meetings.stream().map(CrmActivityMeetingResponseDto::getId).toList());
		meetings
			.forEach(meeting -> meeting.setContactIds(contactIdsByMeeting.getOrDefault(meeting.getId(), List.of())));

		log.info("getMeetings: execution ended");
		return new ResponseEntityDto(false, meetings);
	}

}
