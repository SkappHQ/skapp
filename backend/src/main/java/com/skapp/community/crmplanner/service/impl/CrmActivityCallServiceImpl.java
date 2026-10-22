package com.skapp.community.crmplanner.service.impl;

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
import com.skapp.community.crmplanner.type.CrmActivityCallSort;
import com.skapp.community.crmplanner.util.CrmValidations;
import com.skapp.community.peopleplanner.model.Employee;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CrmActivityCallServiceImpl implements CrmActivityCallService {

	private final CrmActivityCallDao crmActivityCallDao;

	private final UserService userService;

	private final TimeZoneService timeZoneService;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getCalls(CrmActivityCallFilterDto filterDto) {
		Employee currentEmployee = userService.getCurrentUser().getEmployee();

		CrmActivityCallFilterParams params = new CrmActivityCallFilterParams();
		params.setCurrentEmployeeId(currentEmployee.getEmployeeId());
		params.setCrmRole(currentEmployee.getEmployeeRole().getCrmRole());
		params.setIsSuperAdmin(currentEmployee.getEmployeeRole().getIsSuperAdmin());

		boolean hasDateRange = filterDto.getStartDate() != null || filterDto.getEndDate() != null;
		if (params.getCrmRole() == Role.CRM_SALES_REPRESENTATIVE && !Boolean.TRUE.equals(params.getIsSuperAdmin())
				&& (filterDto.getOwnerId() != null || hasDateRange)) {
			throw new AccessDeniedException(CommonMessageConstant.COMMON_ERROR_ACCESS_DENIED.name());
		}

		CrmValidations.validateActivityDateRange(filterDto.getStartDate(), filterDto.getEndDate());

		params.setOwnerId(filterDto.getOwnerId());
		params.setSearchKeyword(filterDto.getSearchKeyword());
		params.setSortKey(filterDto.getSortKey() != null ? filterDto.getSortKey() : CrmActivityCallSort.LOGGED_AT);
		params.setSortOrder(filterDto.getSortOrder() != null ? filterDto.getSortOrder() : Sort.Direction.DESC);

		if (hasDateRange) {
			ZoneId requestZone = timeZoneService.requestTimezone();
			if (filterDto.getStartDate() != null) {
				params.setLoggedFrom(filterDto.getStartDate().atStartOfDay(requestZone).toInstant());
			}
			if (filterDto.getEndDate() != null) {
				params.setLoggedBefore(filterDto.getEndDate().plusDays(1).atStartOfDay(requestZone).toInstant());
			}
		}

		List<CrmActivityCallResponseDto> calls = crmActivityCallDao.findCalls(params);
		return new ResponseEntityDto(false, calls);
	}

}
