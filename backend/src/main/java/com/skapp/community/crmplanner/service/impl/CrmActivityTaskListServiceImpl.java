package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.TimeZoneService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.util.StringUtils;
import com.skapp.community.crmplanner.payload.request.CrmActivityTaskFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityTaskResponseDto;
import com.skapp.community.crmplanner.repository.CrmActivityTaskDao;
import com.skapp.community.crmplanner.service.CrmActivityTaskListService;
import com.skapp.community.crmplanner.type.CrmActivityTaskFilterParams;
import com.skapp.community.crmplanner.type.CrmActivityTaskSort;
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

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmActivityTaskListServiceImpl implements CrmActivityTaskListService {

	private final CrmActivityTaskDao crmActivityTaskDao;

	private final UserService userService;

	private final TimeZoneService timeZoneService;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getTasks(CrmActivityTaskFilterDto filterDto) {
		log.info("getTasks: execution started");

		Employee currentEmployee = userService.getCurrentUser().getEmployee();
		CrmActivityTaskSort sortKey = filterDto.getSortKey() != null ? filterDto.getSortKey()
				: CrmActivityTaskSort.DUE_AT;

		CrmActivityTaskFilterParams params = new CrmActivityTaskFilterParams();
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
		Sort.Direction defaultSortOrder = sortKey == CrmActivityTaskSort.OWNER ? Sort.Direction.ASC
				: Sort.Direction.DESC;
		params.setSortOrder(filterDto.getSortOrder() != null ? filterDto.getSortOrder() : defaultSortOrder);

		ZoneId zone = timeZoneService.requestTimezone();
		if (filterDto.getStartDate() != null) {
			params.setRangeStart(filterDto.getStartDate().atStartOfDay(zone).toInstant());
		}
		if (filterDto.getEndDate() != null) {
			params.setRangeEnd(filterDto.getEndDate().plusDays(1).atStartOfDay(zone).toInstant());
		}

		List<CrmActivityTaskResponseDto> tasks = crmActivityTaskDao.findTasks(params);

		log.info("getTasks: execution ended");
		return new ResponseEntityDto(false, tasks);
	}

	private String toSearchPattern(String searchKeyword) {
		if (StringUtils.isNullOrBlank(searchKeyword)) {
			return null;
		}
		return "%" + StringUtils.escapeLikePattern(searchKeyword.toLowerCase()) + "%";
	}

}
