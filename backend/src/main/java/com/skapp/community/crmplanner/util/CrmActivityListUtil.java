package com.skapp.community.crmplanner.util;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.util.StringUtils;
import com.skapp.community.crmplanner.payload.request.CrmActivityListFilterDto;
import com.skapp.community.crmplanner.type.CrmActivityListParams;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import lombok.experimental.UtilityClass;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;

import java.time.ZoneId;
import java.util.Locale;

@UtilityClass
public class CrmActivityListUtil {

	public void applyFilters(CrmActivityListParams params, CrmActivityListFilterDto filterDto, Employee currentEmployee,
			ZoneId zone, Sort.Direction defaultSortOrder) {
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
		params.setSortOrder(filterDto.getSortOrder() != null ? filterDto.getSortOrder() : defaultSortOrder);

		if (filterDto.getStartDate() != null) {
			params.setRangeStart(filterDto.getStartDate().atStartOfDay(zone).toInstant());
		}
		if (filterDto.getEndDate() != null) {
			params.setRangeEnd(filterDto.getEndDate().plusDays(1).atStartOfDay(zone).toInstant());
		}
	}

	private String toSearchPattern(String searchKeyword) {
		if (StringUtils.isNullOrBlank(searchKeyword)) {
			return null;
		}
		return "%" + StringUtils.escapeLikePattern(searchKeyword.trim().toLowerCase(Locale.ROOT)) + "%";
	}

}
