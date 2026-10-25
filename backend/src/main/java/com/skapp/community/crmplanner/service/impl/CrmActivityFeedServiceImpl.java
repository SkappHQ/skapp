package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.TimeZoneService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.util.StringUtils;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.payload.request.CrmActivityFeedFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityFeedResponseDto;
import com.skapp.community.crmplanner.repository.CrmActivityFeedDao;
import com.skapp.community.crmplanner.service.CrmActivityFeedService;
import com.skapp.community.crmplanner.service.CrmActivityScopeResolver;
import com.skapp.community.crmplanner.type.CrmActivityFeedCriteria;
import com.skapp.community.crmplanner.type.CrmActivityScope;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Set;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmActivityFeedServiceImpl implements CrmActivityFeedService {

	private static final int BY_MONTH_PAGE_SIZE = 25;

	private final UserService userService;

	private final TimeZoneService timeZoneService;

	private final CrmActivityScopeResolver crmActivityScopeResolver;

	private final CrmActivityFeedDao crmActivityFeedDao;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getActivities(CrmActivityFeedFilterDto filterDto) {
		log.info("getActivities: execution started");

		CrmActivityScope scope = crmActivityScopeResolver.resolveScope(userService.getCurrentUser());

		LocalDate from = scope.canFilter() ? filterDto.getFrom() : null;
		LocalDate to = scope.canFilter() ? filterDto.getTo() : null;
		if (from != null && to != null && to.isBefore(from)) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_ACTIVITY_FEED_DATE_RANGE_INVALID);
		}

		ZoneId zone = timeZoneService.requestTimezone();
		Instant todayStart = timeZoneService.currentRequestDayStart();

		CrmActivityFeedCriteria criteria = new CrmActivityFeedCriteria(filterDto.getType(),
				resolveOwnerIds(scope, filterDto.getOwnerId()), buildSearchPattern(filterDto.getSearch()),
				from == null ? null : from.atStartOfDay(zone).toInstant(),
				to == null ? null : to.plusDays(1).atStartOfDay(zone).toInstant(), Instant.now(), todayStart,
				todayStart.atZone(zone).toLocalDate().plusDays(1).atStartOfDay(zone).toInstant(),
				Math.max(filterDto.getPage(), 0), BY_MONTH_PAGE_SIZE);

		CrmActivityFeedResponseDto response = crmActivityFeedDao.findActivityFeed(criteria);

		log.info("getActivities: execution ended");
		return new ResponseEntityDto(false, response);
	}

	private String buildSearchPattern(String search) {
		if (search == null || search.isBlank()) {
			return null;
		}
		return "%" + StringUtils.escapeLikePattern(search.trim().toLowerCase()) + "%";
	}

	private Set<Long> resolveOwnerIds(CrmActivityScope scope, Long requestedOwnerId) {
		if (!scope.canFilter() || requestedOwnerId == null) {
			return scope.orgWide() ? null : scope.ownerIds();
		}
		return scope.includesOwner(requestedOwnerId) ? Set.of(requestedOwnerId) : Set.of();
	}

}
