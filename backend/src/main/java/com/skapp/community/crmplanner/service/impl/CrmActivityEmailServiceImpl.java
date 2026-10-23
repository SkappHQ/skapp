package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.TimeZoneService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.util.StringUtils;
import com.skapp.community.crmplanner.payload.request.CrmActivityEmailFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityEmailResponseDto;
import com.skapp.community.crmplanner.repository.CrmActivityEmailDao;
import com.skapp.community.crmplanner.service.CrmActivityEmailService;
import com.skapp.community.crmplanner.type.CrmActivityEmailFilterParams;
import com.skapp.community.crmplanner.type.CrmActivityEmailSort;
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
public class CrmActivityEmailServiceImpl implements CrmActivityEmailService {

	private final CrmActivityEmailDao crmActivityEmailDao;

	private final UserService userService;

	private final TimeZoneService timeZoneService;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getEmails(CrmActivityEmailFilterDto filterDto) {
		log.info("getEmails: execution started");

		User currentUser = userService.getCurrentUser();
		CrmActivityEmailSort sortKey = filterDto.getSortKey() != null ? filterDto.getSortKey()
				: CrmActivityEmailSort.LOGGED_AT;

		CrmActivityEmailFilterParams params = new CrmActivityEmailFilterParams();
		params.setSortKey(sortKey);
		boolean isRepresentative = CrmUtil.isCrmSalesRepresentative(currentUser);
		params.setCurrentEmployeeId(currentUser.getEmployee().getEmployeeId());
		params.setIsRestrictedToOwner(isRepresentative);

		CrmValidations.validateActivityDateRange(filterDto.getStartDate(), filterDto.getEndDate());

		params.setOwnerId(filterDto.getOwnerId());
		if (!StringUtils.isNullOrBlank(filterDto.getSearchKeyword())) {
			params.setSearchPattern(
					"%" + StringUtils.escapeLikePattern(filterDto.getSearchKeyword().toLowerCase()) + "%");
		}
		Sort.Direction defaultSortOrder = sortKey == CrmActivityEmailSort.OWNER ? Sort.Direction.ASC
				: Sort.Direction.DESC;
		params.setSortOrder(filterDto.getSortOrder() != null ? filterDto.getSortOrder() : defaultSortOrder);

		ZoneId zone = timeZoneService.requestTimezone();
		if (filterDto.getStartDate() != null) {
			params.setRangeStart(filterDto.getStartDate().atStartOfDay(zone).toInstant());
		}
		if (filterDto.getEndDate() != null) {
			params.setRangeEnd(filterDto.getEndDate().plusDays(1).atStartOfDay(zone).toInstant());
		}

		List<CrmActivityEmailResponseDto> emails = crmActivityEmailDao.findEmails(params);

		Map<Long, List<Long>> contactIdsByEmail = crmActivityEmailDao
			.findContactIdsByEmailId(emails.stream().map(CrmActivityEmailResponseDto::getId).toList());
		emails.forEach(email -> email.setContactIds(contactIdsByEmail.getOrDefault(email.getId(), List.of())));

		log.info("getEmails: execution ended");
		return new ResponseEntityDto(false, emails);
	}

}
