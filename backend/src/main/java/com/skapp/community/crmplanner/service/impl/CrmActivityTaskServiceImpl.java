package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.crmplanner.constant.CrmConstants;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.mapper.CrmMapper;
import com.skapp.community.crmplanner.model.CrmActivityTask;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.payload.request.CrmActivityTaskCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmActivityTaskEditRequestDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityTaskResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmDealResponseDto;
import com.skapp.community.crmplanner.repository.CrmActivityTaskDao;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.repository.CrmContactDao;
import com.skapp.community.crmplanner.repository.CrmDealDao;
import com.skapp.community.crmplanner.service.CrmActivityTaskService;
import com.skapp.community.crmplanner.service.CrmOwnerResolverService;
import com.skapp.community.crmplanner.util.CrmUtil;
import com.skapp.community.crmplanner.util.CrmValidations;
import com.skapp.community.peopleplanner.model.Employee;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmActivityTaskServiceImpl implements CrmActivityTaskService {

	private final CrmActivityTaskDao crmActivityTaskDao;

	private final UserService userService;

	private final CrmMapper crmMapper;

	private final CrmContactDao crmContactDao;

	private final CrmDealDao crmDealDao;

	private final CrmCompanyDao crmCompanyDao;

	private final CrmOwnerResolverService crmOwnerResolver;

	@Override
	@Transactional
	public ResponseEntityDto createTask(CrmActivityTaskCreateRequestDto requestDto) {
		log.info("createTask: execution started");
		validateActivityCreationLimit();

		CrmValidations.validateTaskName(requestDto.getName());
		CrmValidations.validateTaskDueAt(requestDto.getDueAt());
		CrmValidations.validateTaskNotes(requestDto.getNotes());

		User currentUser = userService.getCurrentUser();
		Employee owner = requestDto.getOwnerId() != null
				? crmOwnerResolver.resolveOwner(requestDto.getOwnerId(), currentUser) : currentUser.getEmployee();

		CrmActivityTask task = new CrmActivityTask();
		task.setName(requestDto.getName());
		task.setPriority(requestDto.getPriority() != null ? requestDto.getPriority()
				: CrmConstants.DEFAULT_ACTIVITY_TASK_PRIORITY);
		task.setDueAt(requestDto.getDueAt());
		task.setNotes(requestDto.getNotes());
		task.setIsCompleted(false);
		task.setOwner(owner);

		if (requestDto.getContactId() != null) {
			CrmContact contact = crmContactDao.findByIdAndIsDeletedFalse(requestDto.getContactId())
				.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_CONTACT_NOT_FOUND));
			task.setContact(contact);
		}

		if (requestDto.getDealId() != null) {
			CrmDeal deal = crmDealDao.findByIdAndIsDeletedFalse(requestDto.getDealId())
				.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_NOT_FOUND));
			if (CrmValidations.isOwnerRestrictedForRepresentative(currentUser, deal.getOwner().getEmployeeId())) {
				throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_VIEW_DENIED);
			}
			CrmValidations.validateDealMatchesContactCompany(deal, task.getContact());
			task.setDeal(deal);
		}

		if (requestDto.getCompanyId() != null) {
			CrmCompany company = crmCompanyDao.findByIdAndIsDeletedFalse(requestDto.getCompanyId())
				.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_COMPANY_NOT_FOUND));
			task.setCompany(company);
		}

		CrmActivityTask savedTask = crmActivityTaskDao.save(task);

		log.info("createTask: execution ended");
		return new ResponseEntityDto(false, crmMapper.crmActivityTaskToCrmActivityTaskResponseDto(savedTask));
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getTaskById(Long id) {
		log.info("getTaskById: execution started");

		CrmActivityTask task = crmActivityTaskDao.findTaskById(id);
		if (task == null) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_TASK_NOT_FOUND);
		}

		User currentUser = userService.getCurrentUser();
		if (CrmValidations.isOwnerRestrictedForRepresentative(currentUser, task.getOwner().getEmployeeId())) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_TASK_VIEW_DENIED);
		}

		CrmActivityTaskResponseDto response = crmMapper.crmActivityTaskToCrmActivityTaskResponseDto(task);
		if (task.getContact() != null && Boolean.TRUE.equals(task.getContact().getIsDeleted())) {
			response.setContactId(null);
			response.setContact(null);
		}
		if (task.getDeal() != null && Boolean.TRUE.equals(task.getDeal().getIsDeleted())) {
			response.setDealId(null);
			response.setDeal(null);
		}
		else if (task.getDeal() != null) {
			response.setDeal(CrmUtil.toDealResponseDto(crmMapper, task.getDeal()));
		}
		if (task.getCompany() != null && Boolean.TRUE.equals(task.getCompany().getIsDeleted())) {
			response.setCompanyId(null);
			response.setCompany(null);
		}

		CrmDealResponseDto deal = response.getDeal();
		if (deal != null && CrmValidations.isOwnerRestrictedForRepresentative(currentUser, deal.getOwnerId())) {
			CrmDealResponseDto restrictedDeal = new CrmDealResponseDto();
			restrictedDeal.setId(deal.getId());
			restrictedDeal.setOwnerId(deal.getOwnerId());
			response.setDeal(restrictedDeal);
		}

		log.info("getTaskById: execution ended");
		return new ResponseEntityDto(false, response);
	}

	@Override
	@Transactional
	public ResponseEntityDto editTask(Long id, CrmActivityTaskEditRequestDto requestDto) {
		log.info("editTask: execution started");

		CrmActivityTask task = crmActivityTaskDao.findTaskById(id);
		if (task == null) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_TASK_NOT_FOUND);
		}

		User currentUser = userService.getCurrentUser();
		if (CrmValidations.isOwnerRestrictedForRepresentative(currentUser, task.getOwner().getEmployeeId())) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_TASK_EDIT_DENIED);
		}

		if (requestDto.getName() != null) {
			CrmValidations.validateTaskName(requestDto.getName());
			task.setName(requestDto.getName());
		}

		if (requestDto.getPriority() != null) {
			task.setPriority(requestDto.getPriority());
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

		if (requestDto.getDealId() != null) {
			CrmDeal deal = crmDealDao.findByIdAndIsDeletedFalse(requestDto.getDealId())
				.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_NOT_FOUND));
			if (CrmValidations.isOwnerRestrictedForRepresentative(currentUser, deal.getOwner().getEmployeeId())) {
				throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_VIEW_DENIED);
			}
			task.setDeal(deal);
		}

		if (requestDto.getCompanyId() != null) {
			CrmCompany company = crmCompanyDao.findByIdAndIsDeletedFalse(requestDto.getCompanyId())
				.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_COMPANY_NOT_FOUND));
			task.setCompany(company);
		}

		if (requestDto.getContactId() != null || requestDto.getDealId() != null) {
			CrmValidations.validateDealMatchesContactCompany(task.getDeal(), task.getContact());
		}

		if (requestDto.getIsCompleted() != null) {
			task.setIsCompleted(requestDto.getIsCompleted());
			task.setCompletedAt(Boolean.TRUE.equals(requestDto.getIsCompleted()) ? Instant.now() : null);
		}

		CrmActivityTask updatedTask = crmActivityTaskDao.save(task);

		log.info("editTask: execution ended");
		return new ResponseEntityDto(false, crmMapper.crmActivityTaskToCrmActivityTaskResponseDto(updatedTask));
	}

	protected void validateActivityCreationLimit() {
	}

}
