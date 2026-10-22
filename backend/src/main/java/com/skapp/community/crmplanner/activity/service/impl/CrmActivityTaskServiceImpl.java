package com.skapp.community.crmplanner.activity.service.impl;

import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.crmplanner.activity.mapper.CrmActivityMapper;
import com.skapp.community.crmplanner.activity.payload.request.CrmActivityTaskCompleteRequestDto;
import com.skapp.community.crmplanner.activity.payload.request.CrmActivityTaskEditRequestDto;
import com.skapp.community.crmplanner.activity.payload.response.CrmActivityTaskResponseDto;
import com.skapp.community.crmplanner.activity.repository.CrmActivityFeedRepository;
import com.skapp.community.crmplanner.activity.service.CrmActivityScopeService;
import com.skapp.community.crmplanner.activity.service.CrmActivityTaskService;
import com.skapp.community.crmplanner.activity.type.CrmActivityFeedRecord;
import com.skapp.community.crmplanner.activity.type.CrmActivityScope;
import com.skapp.community.crmplanner.activity.type.CrmActivityType;
import com.skapp.community.crmplanner.activity.util.CrmActivityFeedUtil;
import com.skapp.community.crmplanner.activity.util.CrmActivityValidations;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.model.CrmActivityTask;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.repository.CrmActivityTaskDao;
import com.skapp.community.crmplanner.repository.CrmContactDao;
import com.skapp.community.crmplanner.repository.CrmDealDao;
import com.skapp.community.crmplanner.service.CrmOwnerResolverService;
import com.skapp.community.peopleplanner.model.Employee;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.openapitools.jackson.nullable.JsonNullable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmActivityTaskServiceImpl implements CrmActivityTaskService {

	private final CrmActivityTaskDao crmActivityTaskDao;

	private final CrmActivityFeedRepository crmActivityFeedRepository;

	private final CrmContactDao crmContactDao;

	private final CrmDealDao crmDealDao;

	private final CrmActivityScopeService crmActivityScopeService;

	private final CrmOwnerResolverService crmOwnerResolverService;

	private final UserService userService;

	private final CrmActivityMapper crmActivityMapper;

	private final MessageUtil messageUtil;

	@Override
	@Transactional
	public ResponseEntityDto completeTask(Long id, CrmActivityTaskCompleteRequestDto requestDto) {
		log.info("completeTask: execution started");

		CrmActivityValidations.validateTaskCompletion(requestDto.getIsCompleted());

		CrmActivityTask task = findActiveTask(id);
		CrmActivityScope scope = crmActivityScopeService.resolveScope(userService.getCurrentUser());
		requireTaskAccess(scope, task, "completeTask", CrmMessageConstant.CRM_ERROR_ACTIVITY_TASK_EDIT_DENIED);

		applyCompletion(task, requestDto.getIsCompleted());
		crmActivityTaskDao.save(task);

		CrmActivityFeedRecord updated = crmActivityFeedRepository.findActivityById(CrmActivityType.TASK, id)
			.orElseThrow(() -> new EntityNotFoundException(CrmMessageConstant.CRM_ERROR_ACTIVITY_TASK_NOT_FOUND));

		log.info("completeTask: execution ended for taskId={}", id);
		return new ResponseEntityDto(false, CrmActivityFeedUtil.toRow(updated, scope, List.of()));
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getTaskById(Long id) {
		log.info("getTaskById: execution started");

		CrmActivityTask task = findActiveTask(id);
		CrmActivityScope scope = crmActivityScopeService.resolveScope(userService.getCurrentUser());
		requireTaskAccess(scope, task, "getTaskById", CrmMessageConstant.CRM_ERROR_ACTIVITY_TASK_VIEW_DENIED);

		log.info("getTaskById: execution ended");
		return new ResponseEntityDto(false, toResponseDto(task, scope));
	}

	@Override
	@Transactional
	public ResponseEntityDto editTask(Long id, CrmActivityTaskEditRequestDto requestDto) {
		log.info("editTask: execution started");

		CrmActivityTask task = findActiveTask(id);
		User currentUser = userService.getCurrentUser();
		CrmActivityScope scope = crmActivityScopeService.resolveScope(currentUser);
		requireTaskAccess(scope, task, "editTask", CrmMessageConstant.CRM_ERROR_ACTIVITY_TASK_EDIT_DENIED);

		if (requestDto.getName() != null) {
			CrmActivityValidations.validateTaskName(requestDto.getName());
			task.setName(requestDto.getName());
		}

		if (requestDto.getPriority() != null) {
			task.setPriority(requestDto.getPriority());
		}

		if (requestDto.getIsCompleted() != null && !requestDto.getIsCompleted().equals(task.getIsCompleted())) {
			applyCompletion(task, requestDto.getIsCompleted());
		}

		if (requestDto.getDueAt() != null) {
			task.setDueAt(requestDto.getDueAt());
		}

		if (isProvided(requestDto.getNotes())) {
			String notes = requestDto.getNotes().get();
			CrmActivityValidations.validateTaskNotes(notes);
			task.setNotes(notes);
		}

		if (requestDto.getOwnerId() != null) {
			task.setOwner(resolveOwner(requestDto.getOwnerId(), currentUser, scope, task));
		}

		if (isProvided(requestDto.getContactId())) {
			applyContact(task, requestDto.getContactId().get());
		}

		if (isProvided(requestDto.getDealId())) {
			applyDeal(task, requestDto.getDealId().get());
		}

		CrmActivityValidations.validateDealBelongsToContact(task.getDeal(), task.getContact());

		CrmActivityTask updatedTask = crmActivityTaskDao.save(task);

		log.info("editTask: execution ended for taskId={}", id);
		return new ResponseEntityDto(false, toResponseDto(updatedTask, scope));
	}

	private CrmActivityTask findActiveTask(Long id) {
		return crmActivityTaskDao.findByIdAndIsDeletedFalse(id)
			.orElseThrow(() -> new EntityNotFoundException(CrmMessageConstant.CRM_ERROR_ACTIVITY_TASK_NOT_FOUND));
	}

	private void requireTaskAccess(CrmActivityScope scope, CrmActivityTask task, String action,
			CrmMessageConstant deniedMessage) {
		Long ownerId = task.getOwner() != null ? task.getOwner().getEmployeeId() : null;
		if (!scope.includesOwner(ownerId)) {
			log.warn("{}: rejected access userId={} role={} taskId={} ownerId={} errorType={} timestamp={}", action,
					scope.viewerId(), scope.role(), task.getId(), ownerId, deniedMessage.name(), Instant.now());
			throw new AccessDeniedException(messageUtil.getMessage(deniedMessage));
		}
	}

	private Employee resolveOwner(Long ownerId, User currentUser, CrmActivityScope scope, CrmActivityTask task) {
		Employee owner = crmOwnerResolverService.resolveOwner(ownerId, currentUser);
		if (!scope.includesOwner(owner.getEmployeeId())) {
			log.warn(
					"editTask: rejected owner reassignment userId={} role={} taskId={} requestedOwnerId={} "
							+ "errorType={} timestamp={}",
					scope.viewerId(), scope.role(), task.getId(), ownerId,
					CrmMessageConstant.CRM_ERROR_ACTIVITY_TASK_EDIT_DENIED.name(), Instant.now());
			throw new AccessDeniedException(
					messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_ACTIVITY_TASK_EDIT_DENIED));
		}
		return owner;
	}

	private void applyContact(CrmActivityTask task, Long contactId) {
		if (contactId == null) {
			task.setContact(null);
			task.setCompany(null);
			return;
		}

		CrmContact contact = crmContactDao.findByIdAndIsDeletedFalse(contactId)
			.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_CONTACT_NOT_FOUND));
		task.setContact(contact);
		task.setCompany(contact.getCompany());
	}

	private void applyDeal(CrmActivityTask task, Long dealId) {
		if (dealId == null) {
			task.setDeal(null);
			return;
		}

		CrmDeal deal = crmDealDao.findByIdAndIsDeletedFalse(dealId)
			.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_NOT_FOUND));
		task.setDeal(deal);
	}

	private boolean isProvided(JsonNullable<?> value) {
		return value != null && value.isPresent();
	}

	private void applyCompletion(CrmActivityTask task, boolean completed) {
		task.setIsCompleted(completed);
		task.setCompletedAt(completed ? Instant.now() : null);
	}

	private CrmActivityTaskResponseDto toResponseDto(CrmActivityTask task, CrmActivityScope scope) {
		CrmActivityTaskResponseDto dto = crmActivityMapper.crmActivityTaskToCrmActivityTaskResponseDto(task);
		Long ownerId = task.getOwner() != null ? task.getOwner().getEmployeeId() : null;
		Long dealOwnerId = task.getDeal() != null && task.getDeal().getOwner() != null
				? task.getDeal().getOwner().getEmployeeId() : null;
		dto.setCanComplete(scope.includesOwner(ownerId));
		if (!scope.canViewDeal(dealOwnerId)) {
			dto.setDeal(null);
		}
		return dto;
	}

}
