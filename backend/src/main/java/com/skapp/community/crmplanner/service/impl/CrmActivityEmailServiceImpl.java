package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.TimeZoneService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.crmplanner.payload.request.CrmActivityEmailFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityEmailResponseDto;
import com.skapp.community.crmplanner.repository.CrmActivityEmailDao;
import com.skapp.community.crmplanner.service.CrmActivityEmailService;
import com.skapp.community.crmplanner.type.CrmActivityContactLink;
import com.skapp.community.crmplanner.type.CrmActivityEmailFilterParams;
import com.skapp.community.crmplanner.type.CrmActivityEmailSort;
import com.skapp.community.crmplanner.util.CrmActivityListUtil;
import com.skapp.community.peopleplanner.model.Employee;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmActivityEmailServiceImpl implements CrmActivityEmailService {

	private final CrmActivityEmailDao crmActivityEmailDao;

	private final UserService userService;

	private final TimeZoneService timeZoneService;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getEmails(CrmActivityEmailFilterDto filterDto) {
		log.info("getEmails: execution started");

		Employee currentEmployee = userService.getCurrentUser().getEmployee();
		CrmActivityEmailSort sortKey = filterDto.getSortKey() != null ? filterDto.getSortKey()
				: CrmActivityEmailSort.LOGGED_AT;

		CrmActivityEmailFilterParams params = new CrmActivityEmailFilterParams();
		params.setSortKey(sortKey);
		CrmActivityListUtil.applyFilters(params, filterDto, currentEmployee, timeZoneService.requestTimezone(),
				sortKey == CrmActivityEmailSort.OWNER ? Sort.Direction.ASC : Sort.Direction.DESC);

		List<CrmActivityEmailResponseDto> emails = crmActivityEmailDao.findEmails(params);

		Map<Long, List<Long>> contactIdsByEmail = crmActivityEmailDao
			.findContactLinks(emails.stream().map(CrmActivityEmailResponseDto::getId).toList())
			.stream()
			.collect(Collectors.groupingBy(CrmActivityContactLink::activityId,
					Collectors.mapping(CrmActivityContactLink::contactId, Collectors.toList())));
		emails.forEach(email -> email.setContactIds(contactIdsByEmail.getOrDefault(email.getId(), List.of())));

		log.info("getEmails: execution ended");
		return new ResponseEntityDto(false, emails);
	}

}
