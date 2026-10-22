package com.skapp.community.crmplanner.activity.service.impl;

import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.crmplanner.activity.payload.request.CrmActivityTaskCompleteRequestDto;
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
import com.skapp.community.crmplanner.repository.CrmActivityTaskDao;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

	private final CrmActivityScopeService crmActivityScopeService;

	private final UserService userService;

	private final MessageUtil messageUtil;

	@Override
	@Transactional
	public ResponseEntityDto completeTask(Long id, CrmActivityTaskCompleteRequestDto requestDto) {
		log.info("completeTask: execution started");

		CrmActivityValidations.validateTaskCompletion(requestDto.getIsCompleted());

		CrmActivityTask task = findActiveTask(id);
		CrmActivityScope scope = crmActivityScopeService.resolveScope(userService.getCurrentUser());
		requireTaskAccess(scope, task);

		task.setIsCompleted(requestDto.getIsCompleted());
		task.setCompletedAt(requestDto.getIsCompleted() ? Instant.now() : null);
		crmActivityTaskDao.save(task);

		CrmActivityFeedRecord updated = crmActivityFeedRepository.findActivityById(CrmActivityType.TASK, id)
			.orElseThrow(() -> new EntityNotFoundException(CrmMessageConstant.CRM_ERROR_ACTIVITY_TASK_NOT_FOUND));

		log.info("completeTask: execution ended for taskId={}", id);
		return new ResponseEntityDto(false, CrmActivityFeedUtil.toRow(updated, scope, List.of()));
	}

	private CrmActivityTask findActiveTask(Long id) {
		return crmActivityTaskDao.findByIdAndIsDeletedFalse(id)
			.orElseThrow(() -> new EntityNotFoundException(CrmMessageConstant.CRM_ERROR_ACTIVITY_TASK_NOT_FOUND));
	}

	private void requireTaskAccess(CrmActivityScope scope, CrmActivityTask task) {
		Long ownerId = task.getOwner() != null ? task.getOwner().getEmployeeId() : null;
		if (!scope.includesOwner(ownerId)) {
			log.warn("completeTask: rejected access userId={} role={} taskId={} ownerId={} errorType={} timestamp={}",
					scope.viewerId(), scope.role(), task.getId(), ownerId,
					CrmMessageConstant.CRM_ERROR_ACTIVITY_TASK_EDIT_DENIED.name(), Instant.now());
			throw new AccessDeniedException(
					messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_ACTIVITY_TASK_EDIT_DENIED));
		}
	}

}
