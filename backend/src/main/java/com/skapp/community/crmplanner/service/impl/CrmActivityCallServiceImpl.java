package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.constant.AuthConstants;
import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.TimeZoneService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.Role;
import com.skapp.community.crmplanner.payload.request.CrmActivityCallFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityCallResponseDto;
import com.skapp.community.crmplanner.repository.CrmActivityCallDao;
import com.skapp.community.crmplanner.service.CrmActivityCallService;
import com.skapp.community.crmplanner.type.CrmActivityCallFilterParams;
import com.skapp.community.crmplanner.type.CrmActivityScope;
import com.skapp.community.crmplanner.util.CrmValidations;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CrmActivityCallServiceImpl implements CrmActivityCallService {

	private final CrmActivityCallDao crmActivityCallDao;

	private final UserService userService;

	private final TimeZoneService timeZoneService;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getCalls(CrmActivityCallFilterDto filterDto) {
		CrmActivityScope scope = resolveActivityScope();

		if (scope == CrmActivityScope.SELF && hasManagerOnlyFilter(filterDto)) {
			throw new AccessDeniedException(CommonMessageConstant.COMMON_ERROR_ACCESS_DENIED.name());
		}

		CrmValidations.validateActivityDateRange(filterDto.getStartDate(), filterDto.getEndDate());

		List<CrmActivityCallResponseDto> calls = crmActivityCallDao.findCalls(toFilterParams(filterDto, scope));
		return new ResponseEntityDto(false, calls);
	}

	private CrmActivityScope resolveActivityScope() {
		Set<String> userRoles = userService.getCurrentUserRoles();

		if (userRoles.contains(AuthConstants.AUTH_ROLE + Role.SUPER_ADMIN)
				|| userRoles.contains(AuthConstants.AUTH_ROLE + Role.CRM_ADMIN)) {
			return CrmActivityScope.ORGANIZATION;
		}

		if (userRoles.contains(AuthConstants.AUTH_ROLE + Role.CRM_SALES_MANAGER)) {
			return CrmActivityScope.TEAM;
		}

		return CrmActivityScope.SELF;
	}

	private boolean hasManagerOnlyFilter(CrmActivityCallFilterDto filterDto) {
		return filterDto.getOwnerId() != null || filterDto.getStartDate() != null || filterDto.getEndDate() != null;
	}

	private CrmActivityCallFilterParams toFilterParams(CrmActivityCallFilterDto filterDto, CrmActivityScope scope) {
		Long currentEmployeeId = userService.getCurrentUser().getEmployee().getEmployeeId();
		boolean hasDateRange = filterDto.getStartDate() != null || filterDto.getEndDate() != null;
		ZoneId requestZone = hasDateRange ? timeZoneService.requestTimezone() : null;

		return new CrmActivityCallFilterParams(scope, currentEmployeeId, filterDto.getOwnerId(),
				filterDto.getSearchKeyword(), toDayStart(filterDto.getStartDate(), requestZone),
				toDayStart(filterDto.getEndDate() != null ? filterDto.getEndDate().plusDays(1) : null, requestZone),
				filterDto.getSortKey(), filterDto.getSortOrder());
	}

	private Instant toDayStart(LocalDate date, ZoneId zone) {
		return date != null ? date.atStartOfDay(zone).toInstant() : null;
	}

}
