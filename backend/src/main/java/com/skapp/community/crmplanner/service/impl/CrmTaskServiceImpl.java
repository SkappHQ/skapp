package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
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
import com.skapp.community.crmplanner.payload.request.CrmTaskCreateRequestDto;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.repository.CrmContactDao;
import com.skapp.community.crmplanner.repository.CrmDealDao;
import com.skapp.community.crmplanner.repository.CrmTaskDao;
import com.skapp.community.crmplanner.repository.CrmTaskTypeDao;
import com.skapp.community.crmplanner.service.CrmTaskService;
import com.skapp.community.crmplanner.util.CrmOwnerResolver;
import com.skapp.community.crmplanner.util.CrmValidations;
import com.skapp.community.peopleplanner.model.Employee;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

	private final CrmOwnerResolver crmOwnerResolver;

	private final CrmMapper crmMapper;

	@Override
	@Transactional
	public ResponseEntityDto createTask(CrmTaskCreateRequestDto requestDto) {
		log.info("createTask: execution started");

		CrmValidations.validateTaskName(requestDto.getName());
		CrmValidations.validateTaskTypeId(requestDto.getTypeId());
		CrmValidations.validateTaskTargets(requestDto.getContactId(), requestDto.getCompanyId(),
				requestDto.getDealId());

		User currentUser = userService.getCurrentUser();
		CrmTaskType taskType = crmTaskTypeDao.getReferenceById(requestDto.getTypeId());

		Employee owner = resolveTaskOwner(requestDto.getOwnerId(), currentUser);

		CrmTask task = new CrmTask();
		task.setName(requestDto.getName());
		task.setType(taskType);
		task.setPriority(
				requestDto.getPriority() != null ? requestDto.getPriority() : CrmConstants.DEFAULT_TASK_PRIORITY);
		task.setDueAt(requestDto.getDueAt());
		task.setNotes(normalizeNullableText(requestDto.getNotes()));
		task.setOwner(owner);

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

		CrmTask savedTask = crmTaskDao.save(task);

		log.info("createTask: execution ended with taskId={}", savedTask.getId());
		return new ResponseEntityDto(false, crmMapper.crmTaskToCrmTaskResponseDto(savedTask));
	}

	private Employee resolveTaskOwner(Long ownerId, User currentUser) {
		if (ownerId == null) {
			return currentUser.getEmployee();
		}

		return crmOwnerResolver.resolveOwner(ownerId, currentUser);
	}

	private String normalizeNullableText(String value) {
		return value == null || value.isEmpty() ? null : value;
	}

}
