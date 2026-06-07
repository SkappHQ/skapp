package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.constant.AuthConstants;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.OrganizationService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.Role;
import com.skapp.community.crmplanner.mapper.CrmMapper;
import com.skapp.community.crmplanner.payload.response.CrmGetTasksResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmTaskListResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmTaskResponseDto;
import com.skapp.community.crmplanner.repository.CrmTaskDao;
import com.skapp.community.crmplanner.service.CrmTaskService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmTaskServiceImpl implements CrmTaskService {

	private final CrmTaskDao crmTaskDao;

	private final CrmMapper crmMapper;

	private final UserService userService;

	private final OrganizationService organizationService;

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

		ZoneId orgZone = ZoneId.of(organizationService.getOrganizationTimeZone());
		LocalDate today = LocalDate.now(orgZone);
		LocalDate tomorrow = today.plusDays(1);

		CrmTaskListResponseDto taskSegments = new CrmTaskListResponseDto();
		taskSegments.setOverdue(new ArrayList<>());
		taskSegments.setDueToday(new ArrayList<>());
		taskSegments.setDueTomorrow(new ArrayList<>());
		taskSegments.setUpcoming(new ArrayList<>());

		for (CrmTaskResponseDto task : tasks) {
			LocalDateTime dueAt = task.getDueAt();
			if (dueAt == null) {
				taskSegments.getUpcoming().add(task);
			}
			else {
				LocalDate dueDate = dueAt.toLocalDate();
				if (dueDate.isBefore(today)) {
					taskSegments.getOverdue().add(task);
				}
				else if (dueDate.isEqual(today)) {
					taskSegments.getDueToday().add(task);
				}
				else if (dueDate.isEqual(tomorrow)) {
					taskSegments.getDueTomorrow().add(task);
				}
				else {
					taskSegments.getUpcoming().add(task);
				}
			}
		}

		CrmGetTasksResponseDto response = new CrmGetTasksResponseDto();
		response.setTasks(taskSegments);

		log.info("getTasks: execution ended");

		return new ResponseEntityDto(false, response);
	}

}
