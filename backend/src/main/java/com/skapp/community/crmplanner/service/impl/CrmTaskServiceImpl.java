package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.constant.AuthConstants;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.Role;
import com.skapp.community.crmplanner.mapper.CrmMapper;
import com.skapp.community.crmplanner.payload.response.CrmGetTasksResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmTaskResponseDto;
import com.skapp.community.crmplanner.repository.CrmTaskDao;
import com.skapp.community.crmplanner.service.CrmTaskService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmTaskServiceImpl implements CrmTaskService {

	private final CrmTaskDao crmTaskDao;

	private final CrmMapper crmMapper;

	private final UserService userService;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getTasks() {
		log.info("getTasks: execution started");

		Set<String> roles = userService.getCurrentUserRoles();
		List<CrmTaskResponseDto> tasks;

		if (roles.contains(AuthConstants.AUTH_ROLE + Role.CRM_SALES_MANAGER)) {
			tasks = crmMapper.crmTasksToCrmTaskResponseDtos(crmTaskDao.findAllWithTypeAndOwner());
		}
		else {
			Long employeeId = userService.getCurrentUser().getEmployee().getEmployeeId();
			tasks = crmMapper.crmTasksToCrmTaskResponseDtos(crmTaskDao.findAllWithTypeAndOwnerByOwnerId(employeeId));
		}

		CrmGetTasksResponseDto response = new CrmGetTasksResponseDto();
		response.setTasks(tasks);

		log.info("getTasks: execution ended");

		return new ResponseEntityDto(false, response);
	}

}
