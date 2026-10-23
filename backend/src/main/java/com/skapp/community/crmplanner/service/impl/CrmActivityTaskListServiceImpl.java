package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.TimeZoneService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.crmplanner.payload.request.CrmActivityTaskFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityTaskResponseDto;
import com.skapp.community.crmplanner.repository.CrmActivityTaskDao;
import com.skapp.community.crmplanner.service.CrmActivityTaskListService;
import com.skapp.community.crmplanner.type.CrmActivityTaskFilterParams;
import com.skapp.community.crmplanner.type.CrmActivityTaskSort;
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
		CrmActivityListUtil.applyFilters(params, filterDto, currentEmployee, timeZoneService.requestTimezone(),
				sortKey == CrmActivityTaskSort.OWNER ? Sort.Direction.ASC : Sort.Direction.DESC);

		List<CrmActivityTaskResponseDto> tasks = crmActivityTaskDao.findTasks(params);

		log.info("getTasks: execution ended");
		return new ResponseEntityDto(false, tasks);
	}

}
