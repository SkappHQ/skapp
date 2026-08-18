package com.skapp.community.crmplanner.service.v2.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.mapper.CrmMapperV2;
import com.skapp.community.crmplanner.model.CrmTask;
import com.skapp.community.crmplanner.payload.request.CrmTaskCompletedFilterDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskEditRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskFilterDtoV2;
import com.skapp.community.crmplanner.payload.response.v2.CrmTaskResponseDtoV2;
import com.skapp.community.crmplanner.repository.CrmTaskDao;
import com.skapp.community.crmplanner.service.CrmTaskService;
import com.skapp.community.crmplanner.service.v2.CrmTaskServiceV2;
import com.skapp.community.crmplanner.util.CrmUtil;
import com.skapp.community.crmplanner.util.CrmValidations;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmTaskServiceImplV2 implements CrmTaskServiceV2 {

	private final CrmTaskService crmTaskService;

	private final CrmTaskDao crmTaskDao;

	private final CrmMapperV2 crmMapperV2;

	private final UserService userService;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getTasks(CrmTaskFilterDtoV2 filterDto) {
		log.info("getTasks: execution started");

		User currentUser = userService.getCurrentUser();
		Long ownerId = CrmUtil.isCrmSalesRepresentative(currentUser) ? currentUser.getEmployee().getEmployeeId() : null;

		Pageable pageable = filterDto.getSize() < 0 ? Pageable.unpaged()
				: PageRequest.of(filterDto.getPage(), filterDto.getSize());
		Page<CrmTaskResponseDtoV2> taskPage = crmTaskDao.findTasksV2(ownerId, filterDto, pageable);

		log.info("getTasks: execution ended");
		return new ResponseEntityDto(false, toPageDto(taskPage));
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getCompletedTasks(CrmTaskCompletedFilterDto filterDto) {
		log.info("getCompletedTasks: execution started");

		Pageable pageable = PageRequest.of(filterDto.getPage(), filterDto.getSize());

		User currentUser = userService.getCurrentUser();
		Long ownerId = CrmUtil.isCrmSalesRepresentative(currentUser) ? currentUser.getEmployee().getEmployeeId() : null;
		Page<CrmTaskResponseDtoV2> taskPage = crmTaskDao.findCompletedTasksV2(ownerId, filterDto, pageable);

		log.info("getCompletedTasks: execution ended");
		return new ResponseEntityDto(false, toPageDto(taskPage));
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getRelatedTasks(Long id, int page, int size) {
		log.info("getRelatedTasks: execution started");

		CrmTask task = crmTaskDao.findByIdWithAssociations(id)
			.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_TASK_NOT_FOUND));

		User currentUser = userService.getCurrentUser();
		if (CrmValidations.isOwnerRestrictedForRepresentative(currentUser, task.getOwner().getEmployeeId())) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_TASK_VIEW_DENIED);
		}

		Long ownerId = CrmUtil.isCrmSalesRepresentative(currentUser) ? currentUser.getEmployee().getEmployeeId() : null;
		Pageable pageable = size < 0 ? Pageable.unpaged() : PageRequest.of(page, size);
		Page<CrmTaskResponseDtoV2> taskPage = crmTaskDao.findRelatedTasksV2(id, ownerId, pageable);

		log.info("getRelatedTasks: execution ended");
		return new ResponseEntityDto(false, toPageDto(taskPage));
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getTaskById(Long id) {
		log.info("getTaskById: execution started");

		CrmTask task = crmTaskDao.findByIdWithAssociations(id)
			.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_TASK_NOT_FOUND));

		User currentUser = userService.getCurrentUser();
		if (CrmValidations.isOwnerRestrictedForRepresentative(currentUser, task.getOwner().getEmployeeId())) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_TASK_VIEW_DENIED);
		}

		log.info("getTaskById: execution ended");
		return new ResponseEntityDto(false, CrmUtil.toTaskResponseDtoV2(crmMapperV2, task));
	}

	@Override
	@Transactional
	public ResponseEntityDto createTask(CrmTaskCreateRequestDto requestDto) {
		log.info("createTask: execution started");

		CrmTask savedTask = crmTaskService.persistNewTask(requestDto);

		log.info("createTask: execution ended");
		return new ResponseEntityDto(false, CrmUtil.toTaskResponseDtoV2(crmMapperV2, savedTask));
	}

	@Override
	@Transactional
	public ResponseEntityDto editTask(Long id, CrmTaskEditRequestDto requestDto) {
		log.info("editTask: execution started");

		CrmTask updatedTask = crmTaskService.applyTaskEdit(id, requestDto);

		log.info("editTask: execution ended");
		return new ResponseEntityDto(false, CrmUtil.toTaskResponseDtoV2(crmMapperV2, updatedTask));
	}

	private PageDto toPageDto(Page<CrmTaskResponseDtoV2> taskPage) {
		PageDto pageDto = new PageDto();
		pageDto.setItems(taskPage.getContent());
		pageDto.setCurrentPage(taskPage.getNumber());
		pageDto.setTotalItems(taskPage.getTotalElements());
		pageDto.setTotalPages(taskPage.getTotalPages());
		return pageDto;
	}

}
