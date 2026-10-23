package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.TimeZoneService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.util.StringUtils;
import com.skapp.community.crmplanner.payload.request.CrmActivityMeetingFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityMeetingResponseDto;
import com.skapp.community.crmplanner.repository.CrmActivityMeetingDao;
import com.skapp.community.crmplanner.service.CrmActivityMeetingService;
import com.skapp.community.crmplanner.type.CrmActivityContactLink;
import com.skapp.community.crmplanner.type.CrmActivityMeetingFilterParams;
import com.skapp.community.crmplanner.type.CrmActivityMeetingSort;
import com.skapp.community.crmplanner.util.CrmValidations;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

		Employee currentEmployee = userService.getCurrentUser().getEmployee();
		CrmActivityMeetingSort sortKey = filterDto.getSortKey() != null ? filterDto.getSortKey()
				: CrmActivityMeetingSort.START_AT;

		CrmActivityMeetingFilterParams params = new CrmActivityMeetingFilterParams();
		params.setSortKey(sortKey);
		EmployeeRole employeeRole = currentEmployee.getEmployeeRole();
		params.setCurrentEmployeeId(currentEmployee.getEmployeeId());
		params.setCrmRole(employeeRole.getCrmRole());
		params.setIsSuperAdmin(employeeRole.getIsSuperAdmin());

		boolean hasDateRange = filterDto.getStartDate() != null || filterDto.getEndDate() != null;
		if (params.getCrmRole() == Role.CRM_SALES_REPRESENTATIVE && !Boolean.TRUE.equals(params.getIsSuperAdmin())
				&& (filterDto.getOwnerId() != null || hasDateRange)) {
			throw new AccessDeniedException(CommonMessageConstant.COMMON_ERROR_ACCESS_DENIED.name());
		}

		CrmValidations.validateActivityDateRange(filterDto.getStartDate(), filterDto.getEndDate());

		params.setOwnerId(filterDto.getOwnerId());
		params.setSearchPattern(toSearchPattern(filterDto.getSearchKeyword()));
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
			.findContactLinks(meetings.stream().map(CrmActivityMeetingResponseDto::getId).toList())
			.stream()
			.collect(Collectors.groupingBy(CrmActivityContactLink::activityId,
					Collectors.mapping(CrmActivityContactLink::contactId, Collectors.toList())));
		meetings
			.forEach(meeting -> meeting.setContactIds(contactIdsByMeeting.getOrDefault(meeting.getId(), List.of())));

		log.info("getMeetings: execution ended");
		return new ResponseEntityDto(false, meetings);
	}

	private String toSearchPattern(String searchKeyword) {
		if (StringUtils.isNullOrBlank(searchKeyword)) {
			return null;
		}
		return "%" + StringUtils.escapeLikePattern(searchKeyword.toLowerCase()) + "%";
	}

}
