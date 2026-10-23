package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.TimeZoneService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.crmplanner.payload.request.CrmActivityCallFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityCallResponseDto;
import com.skapp.community.crmplanner.repository.CrmActivityCallDao;
import com.skapp.community.crmplanner.service.CrmActivityCallService;
import com.skapp.community.crmplanner.type.CrmActivityCallFilterParams;
import com.skapp.community.crmplanner.type.CrmActivityCallSort;
import com.skapp.community.crmplanner.util.CrmActivityListUtil;
import com.skapp.community.peopleplanner.model.Employee;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmActivityCallServiceImpl implements CrmActivityCallService {

	private final CrmActivityCallDao crmActivityCallDao;

	private final UserService userService;

	private final TimeZoneService timeZoneService;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getCalls(CrmActivityCallFilterDto filterDto) {
		log.info("getCalls: execution started");

		Employee currentEmployee = userService.getCurrentUser().getEmployee();
		CrmActivityCallSort sortKey = filterDto.getSortKey() != null ? filterDto.getSortKey()
				: CrmActivityCallSort.LOGGED_AT;

		CrmActivityCallFilterParams params = new CrmActivityCallFilterParams();
		params.setSortKey(sortKey);
		CrmActivityListUtil.applyFilters(params, filterDto, currentEmployee, timeZoneService.requestTimezone(),
				sortKey == CrmActivityCallSort.OWNER ? Sort.Direction.ASC : Sort.Direction.DESC);

		List<CrmActivityCallResponseDto> calls = crmActivityCallDao.findCalls(params);

		log.info("getCalls: execution ended");
		return new ResponseEntityDto(false, calls);
	}

}
