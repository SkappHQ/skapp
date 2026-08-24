package com.skapp.community.crmplanner.service.v2.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.util.transformer.PageTransformer;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.mapper.CrmMapperV2;
import com.skapp.community.crmplanner.model.CrmTask;
import com.skapp.community.crmplanner.payload.request.CrmTaskCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskEditRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskFilterDtoV2;
import com.skapp.community.crmplanner.payload.request.CrmTaskRelatedFilterDtoV2;
import com.skapp.community.crmplanner.payload.response.v2.CrmTaskResponseDtoV2;
import com.skapp.community.crmplanner.repository.CrmTaskDao;
import com.skapp.community.crmplanner.service.CrmTaskService;
import com.skapp.community.crmplanner.service.v2.CrmTaskServiceV2;
import com.skapp.community.crmplanner.type.CrmTaskLinkRefs;
import com.skapp.community.crmplanner.type.CrmTaskRelatedParams;
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

	private final PageTransformer pageTransformer;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getTasks(CrmTaskFilterDtoV2 filterDto) {
		log.info("getTasks: execution started");

		User currentUser = userService.getCurrentUser();
		Long ownerId = CrmUtil.isCrmSalesRepresentative(currentUser) ? currentUser.getEmployee().getEmployeeId() : null;

		Pageable pageable = toPageable(filterDto.getPage(), filterDto.getSize());
		Page<CrmTaskResponseDtoV2> taskPage = crmTaskDao.findTasksV2(ownerId, filterDto, pageable);

		log.info("getTasks: execution ended");
		return new ResponseEntityDto(false, toPageDto(taskPage));
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getRelatedTasks(Long id, CrmTaskRelatedFilterDtoV2 filterDto) {
		log.info("getRelatedTasks: execution started");

		CrmTaskLinkRefs linkRefs = crmTaskDao.findTaskLinkRefsById(id)
			.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_TASK_NOT_FOUND));

		User currentUser = userService.getCurrentUser();
		if (CrmValidations.isOwnerRestrictedForRepresentative(currentUser, linkRefs.getOwnerId())) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_TASK_VIEW_DENIED);
		}

		Long ownerId = CrmUtil.isCrmSalesRepresentative(currentUser) ? currentUser.getEmployee().getEmployeeId() : null;
		CrmTaskRelatedParams params = new CrmTaskRelatedParams(linkRefs.getContactId(), linkRefs.getDealId(), ownerId);
		Page<CrmTaskResponseDtoV2> taskPage = crmTaskDao.findRelatedTasksV2(id, params,
				toPageable(filterDto.getPage(), filterDto.getSize()));

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

	private Pageable toPageable(int page, int size) {
		return size <= 0 ? Pageable.unpaged() : PageRequest.of(Math.max(page, 0), size);
	}

	private PageDto toPageDto(Page<CrmTaskResponseDtoV2> taskPage) {
		PageDto pageDto = pageTransformer.transform(taskPage);
		pageDto.setItems(taskPage.getContent());
		return pageDto;
	}

}
