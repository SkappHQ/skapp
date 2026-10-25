package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.TimeZoneService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.payload.request.CrmActivityFeedFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityFeedResponseDto;
import com.skapp.community.crmplanner.repository.CrmActivityFeedDao;
import com.skapp.community.crmplanner.service.CrmActivityFeedService;
import com.skapp.community.crmplanner.service.CrmActivityScopeResolver;
import com.skapp.community.crmplanner.util.CrmUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmActivityFeedServiceImpl implements CrmActivityFeedService {

	private final UserService userService;

	private final TimeZoneService timeZoneService;

	private final CrmActivityScopeResolver crmActivityScopeResolver;

	private final CrmActivityFeedDao crmActivityFeedDao;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getActivities(CrmActivityFeedFilterDto filterDto) {
		log.info("getActivities: execution started");

		User currentUser = userService.getCurrentUser();
		if (CrmUtil.isCrmSalesRepresentative(currentUser)) {
			filterDto.setOwnerId(null);
			filterDto.setFrom(null);
			filterDto.setTo(null);
		}
		if (filterDto.getFrom() != null && filterDto.getTo() != null
				&& filterDto.getTo().isBefore(filterDto.getFrom())) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_ACTIVITY_FEED_DATE_RANGE_INVALID);
		}

		Set<Long> ownerIds = resolveOwnerIds(crmActivityScopeResolver.resolveOwnerIds(currentUser),
				filterDto.getOwnerId());
		CrmActivityFeedResponseDto response = crmActivityFeedDao.findActivityFeed(ownerIds, filterDto,
				timeZoneService.requestTimezone());

		log.info("getActivities: execution ended");
		return new ResponseEntityDto(false, response);
	}

	private Set<Long> resolveOwnerIds(Set<Long> scopeOwnerIds, Long requestedOwnerId) {
		if (requestedOwnerId == null) {
			return scopeOwnerIds;
		}
		return scopeOwnerIds == null || scopeOwnerIds.contains(requestedOwnerId) ? Set.of(requestedOwnerId) : Set.of();
	}

}
