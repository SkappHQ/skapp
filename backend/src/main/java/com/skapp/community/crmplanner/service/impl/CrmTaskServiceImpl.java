package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.crmplanner.constant.CrmConstants;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.mapper.CrmMapper;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmTask;
import com.skapp.community.crmplanner.model.CrmTaskType;
import com.skapp.community.crmplanner.payload.request.CrmTaskCompletedFilterDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskEditRequestDto;
import com.skapp.community.crmplanner.payload.response.CrmGetTasksResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmTaskResponseDto;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.repository.CrmContactDao;
import com.skapp.community.crmplanner.repository.CrmDealDao;
import com.skapp.community.crmplanner.repository.CrmTaskDao;
import com.skapp.community.crmplanner.repository.CrmTaskTypeDao;
import com.skapp.community.crmplanner.service.CrmOwnerResolverService;
import com.skapp.community.crmplanner.service.CrmTaskService;
import com.skapp.community.crmplanner.util.CrmUtil;
import com.skapp.community.crmplanner.util.CrmValidations;
import com.skapp.community.peopleplanner.model.Employee;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmTaskServiceImpl implements CrmTaskService {

	private final CrmTaskDao crmTaskDao;

	private final CrmTaskTypeDao crmTaskTypeDao;

	private final CrmContactDao crmContactDao;

	private final CrmCompanyDao crmCompanyDao;

	private final CrmDealDao crmDealDao;

	private final UserService userService;

	private final CrmOwnerResolverService crmOwnerResolver;

	private final CrmMapper crmMapper;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getTasks() {
		log.info("getTasks: execution started");

		User currentUser = userService.getCurrentUser();
		List<CrmTaskResponseDto> tasks;

		if (CrmUtil.isCrmSalesRepresentative(currentUser)) {
			Long employeeId = currentUser.getEmployee().getEmployeeId();
			tasks = crmMapper.crmTasksToCrmTaskResponseDtos(crmTaskDao.findAllWithTypeAndOwnerByOwnerId(employeeId));
		}
		else {
			tasks = crmMapper.crmTasksToCrmTaskResponseDtos(crmTaskDao.findAllWithTypeAndOwner());
		}

		CrmGetTasksResponseDto response = new CrmGetTasksResponseDto();
		response.setTasks(tasks);

		log.info("getTasks: execution ended");

		return new ResponseEntityDto(false, response);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getCompletedTasks(CrmTaskCompletedFilterDto filterDto) {
		log.info("getCompletedTasks: execution started");		
		Pageable pageable = PageRequest.of(filterDto.getPage(), filterDto.getSize());

		User currentUser = userService.getCurrentUser();
		Page<CrmTask> taskPage;

		if (CrmUtil.isCrmSalesRepresentative(currentUser)) {
			Long employeeId = currentUser.getEmployee().getEmployeeId();
			taskPage = crmTaskDao.findCompletedTasksByOwnerId(employeeId, pageable);
		}
		else {
			taskPage = crmTaskDao.findCompletedTasks(pageable);
		}

		List<CrmTaskResponseDto> tasks = crmMapper.crmTasksToCrmTaskResponseDtos(taskPage.getContent());

		PageDto response = new PageDto();
		response.setItems(tasks);
		response.setCurrentPage(taskPage.getNumber());
		response.setTotalItems(taskPage.getTotalElements());
		response.setTotalPages(taskPage.getTotalPages());

		log.info("getCompletedTasks: execution ended");

		return new ResponseEntityDto(false, response);
	}

	@Override
	@Transactional
	public ResponseEntityDto createTask(CrmTaskCreateRequestDto requestDto) {
		log.info("createTask: execution started");

		CrmValidations.validateTaskName(requestDto.getName());
		CrmValidations.validateTaskTypeId(requestDto.getTypeId());
		CrmValidations.validateTaskTargets(requestDto.getContactId(), requestDto.getCompanyId(),
				requestDto.getDealId());
		CrmValidations.validateTaskDueAt(requestDto.getDueAt());
		CrmValidations.validateTaskNotes(requestDto.getNotes());

		User currentUser = userService.getCurrentUser();
		Employee owner = resolveTaskOwner(requestDto.getOwnerId(), currentUser);

		CrmTaskType taskType = crmTaskTypeDao.getReferenceById(requestDto.getTypeId());

		CrmTask task = new CrmTask();
		task.setName(requestDto.getName());
		task.setType(taskType);
		task.setPriority(
				requestDto.getPriority() != null ? requestDto.getPriority() : CrmConstants.DEFAULT_TASK_PRIORITY);
		task.setDueAt(requestDto.getDueAt());
		task.setNotes(requestDto.getNotes());
		task.setOwner(owner);

		CrmContact contact = null;
		CrmCompany company = null;
		CrmDeal deal = null;

		if (requestDto.getContactId() != null) {
			contact = crmContactDao.findByIdAndIsDeletedFalse(requestDto.getContactId())
				.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_CONTACT_NOT_FOUND));
			task.setContact(contact);
		}

		if (requestDto.getCompanyId() != null) {
			company = crmCompanyDao.findByIdAndIsDeletedFalse(requestDto.getCompanyId())
				.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_COMPANY_NOT_FOUND));
			task.setCompany(company);
		}

		if (requestDto.getDealId() != null) {
			deal = crmDealDao.findByIdAndIsDeletedFalse(requestDto.getDealId())
				.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_NOT_FOUND));
			task.setDeal(deal);
		}

		CrmValidations.validateContactBelongsToCompany(contact, company);
		CrmValidations.validateDealBelongsToContact(deal, contact);
		CrmValidations.validateDealBelongsToCompany(deal, company);

		CrmTask savedTask = crmTaskDao.save(task);

		log.info("createTask: execution ended with taskId={}", savedTask.getId());
		return new ResponseEntityDto(false, crmMapper.crmTaskToCrmTaskResponseDto(savedTask));
	}

	@Override
	@Transactional
	public ResponseEntityDto editTask(Long id, CrmTaskEditRequestDto requestDto) {
		log.info("editTask: execution started");

		CrmTask task = crmTaskDao.findByIdAndIsDeletedFalse(id)
			.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_TASK_NOT_FOUND));

		User currentUser = userService.getCurrentUser();
		if (CrmValidations.isEditRestricted(currentUser, task.getOwner().getEmployeeId())) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_TASK_EDIT_DENIED);
		}

		if (requestDto.getName() != null) {
			CrmValidations.validateTaskName(requestDto.getName());
			task.setName(requestDto.getName());
		}

		if (requestDto.getTypeId() != null) {
			CrmValidations.validateTaskTypeId(requestDto.getTypeId());
			CrmTaskType taskType = crmTaskTypeDao.findById(requestDto.getTypeId())
				.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_TASK_TYPE_NOT_FOUND));
			task.setType(taskType);
		}

		if (requestDto.getPriority() != null) {
			task.setPriority(requestDto.getPriority());
		}

		if (requestDto.getIsCompleted() != null) {
			task.setIsCompleted(requestDto.getIsCompleted());
		}

		if (requestDto.getDueAt() != null) {
			task.setDueAt(requestDto.getDueAt());
		}

		if (requestDto.getNotes() != null) {
			CrmValidations.validateTaskNotes(requestDto.getNotes());
			task.setNotes(requestDto.getNotes());
		}

		if (requestDto.getOwnerId() != null) {
			Employee owner = crmOwnerResolver.resolveOwner(requestDto.getOwnerId(), currentUser);
			task.setOwner(owner);
		}

		if (requestDto.getContactId() != null) {
			CrmContact contact = crmContactDao.findByIdAndIsDeletedFalse(requestDto.getContactId())
				.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_CONTACT_NOT_FOUND));
			task.setContact(contact);
		}

		if (requestDto.getCompanyId() != null) {
			CrmCompany company = crmCompanyDao.findByIdAndIsDeletedFalse(requestDto.getCompanyId())
				.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_COMPANY_NOT_FOUND));
			task.setCompany(company);
		}

		if (requestDto.getDealId() != null) {
			CrmDeal deal = crmDealDao.findByIdAndIsDeletedFalse(requestDto.getDealId())
				.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_NOT_FOUND));
			task.setDeal(deal);
		}

		CrmValidations.validateContactBelongsToCompany(task.getContact(), task.getCompany());
		CrmValidations.validateDealBelongsToContact(task.getDeal(), task.getContact());
		CrmValidations.validateDealBelongsToCompany(task.getDeal(), task.getCompany());

		CrmTask updatedTask = crmTaskDao.save(task);

		log.info("editTask: execution ended successfully");
		return new ResponseEntityDto(false, crmMapper.crmTaskToCrmTaskResponseDto(updatedTask));
	}

	private Employee resolveTaskOwner(Long ownerId, User currentUser) {
		if (ownerId == null) {
			return currentUser.getEmployee();
		}

		return crmOwnerResolver.resolveOwner(ownerId, currentUser);
	}

}
