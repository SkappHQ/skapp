package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.Role;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.mapper.CrmMapper;
import com.skapp.community.crmplanner.model.CrmTask;
import com.skapp.community.crmplanner.payload.request.CrmTaskStatusUpdateDto;
import com.skapp.community.crmplanner.payload.response.CrmTaskResponseDto;
import com.skapp.community.crmplanner.repository.CrmTaskDao;
import com.skapp.community.crmplanner.service.CrmTaskService;
import com.skapp.community.crmplanner.util.CrmValidations;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmTaskServiceImpl implements CrmTaskService {

	private final CrmTaskDao crmTaskDao;

	private final CrmMapper crmMapper;

	private final UserService userService;

	@Override
	@Transactional
	public ResponseEntityDto updateTaskStatus(Long id, CrmTaskStatusUpdateDto taskStatusUpdateDto) {
		log.info("updateTaskStatus: execution started");

		CrmValidations.validateTaskStatus(taskStatusUpdateDto.getIsCompleted());

		CrmTask task = crmTaskDao.findByIdAndIsDeletedFalse(id)
			.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_TASK_NOT_FOUND));

		User currentUser = userService.getCurrentUser();
		Employee currentEmployee = currentUser.getEmployee();
		EmployeeRole employeeRole = currentEmployee.getEmployeeRole();
		Role currentCrmRole = employeeRole != null ? employeeRole.getCrmRole() : null;

		if (currentCrmRole == Role.CRM_SALES_REPRESENTATIVE
				&& !task.getOwner().getEmployeeId().equals(currentEmployee.getEmployeeId())) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_TASK_EDIT_DENIED);
		}

		task.setIsCompleted(taskStatusUpdateDto.getIsCompleted());
		CrmTask updatedTask = crmTaskDao.save(task);

		CrmTaskResponseDto responseDto = crmMapper.crmTaskToCrmTaskResponseDto(updatedTask);

		log.info("updateTaskStatus: execution ended successfully");
		return new ResponseEntityDto(false, responseDto);
	}

}
