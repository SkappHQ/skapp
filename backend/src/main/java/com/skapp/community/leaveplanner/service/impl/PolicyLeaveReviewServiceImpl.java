package com.skapp.community.leaveplanner.service.impl;

import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.Notification;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.repository.NotificationDao;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.NotificationType;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.leaveplanner.constant.LeaveMessageConstant;
import com.skapp.community.leaveplanner.constant.LeaveModuleConstant;
import com.skapp.community.leaveplanner.constant.PolicyLeaveConstant;
import com.skapp.community.leaveplanner.mapper.PolicyLeaveReviewMapper;
import com.skapp.community.leaveplanner.model.PolicyLeaveRequest;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveCancelRequestDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveReviewRequestDto;
import com.skapp.community.leaveplanner.payload.request.PolicyManagerLeaveRequestFilterDto;
import com.skapp.community.leaveplanner.payload.response.LeaveNotificationNudgeResponseDto;
import com.skapp.community.leaveplanner.payload.response.PolicyLeaveRequestManagerDetailResponseDto;
import com.skapp.community.leaveplanner.repository.PolicyLeaveRequestDao;
import com.skapp.community.leaveplanner.service.LeavePolicyService;
import com.skapp.community.leaveplanner.service.PolicyLeaveReviewNotificationService;
import com.skapp.community.leaveplanner.service.PolicyLeaveReviewService;
import com.skapp.community.leaveplanner.type.LeaveRequestSort;
import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import com.skapp.community.leaveplanner.type.ManagerType;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeManager;
import com.skapp.community.peopleplanner.repository.EmployeeManagerDao;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Manager review and employee cancellation for the policy leave flow. Kept separate from
 * {@code PolicyLeaveServiceImpl}, which already owns balances and the apply path.
 * <p>
 * There is deliberately no balance bookkeeping on a transition: policy balances are
 * derived by summing {@code PolicyLeaveConstant.BALANCE_HOLDING_STATUSES} rows, so moving
 * a request to DENIED / REVOKED / CANCELLED releases the days by itself.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PolicyLeaveReviewServiceImpl implements PolicyLeaveReviewService {

	private static final Map<LeaveRequestStatus, Set<LeaveRequestStatus>> MANAGER_TRANSITIONS = buildManagerTransitions();

	private static final Map<LeaveRequestStatus, Set<LeaveRequestStatus>> EMPLOYEE_TRANSITIONS = buildEmployeeTransitions();

	private final UserService userService;

	private final LeavePolicyService leavePolicyService;

	private final PolicyLeaveRequestDao policyLeaveRequestDao;

	private final EmployeeManagerDao employeeManagerDao;

	private final PolicyLeaveReviewMapper policyLeaveReviewMapper;

	private final PolicyLeaveReviewNotificationService policyLeaveReviewNotificationService;

	private final NotificationDao notificationDao;

	private final MessageUtil messageUtil;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getPolicyLeaveRequestsAssignedToManager(
			@NonNull PolicyManagerLeaveRequestFilterDto filterDto) {
		log.info("getPolicyLeaveRequestsAssignedToManager: execution started");
		requireLeavePoliciesEnabled();

		User currentUser = userService.getCurrentUser();

		LeaveRequestSort sortKey = filterDto.getSortKey() == null ? LeaveRequestSort.CREATED_DATE
				: filterDto.getSortKey();
		Sort.Direction sortOrder = filterDto.getSortOrder() == null ? Sort.Direction.DESC : filterDto.getSortOrder();
		Sort sort = Sort.by(sortOrder, sortKey.toString());

		Pageable pageable = filterDto.getSize() < 0 ? Pageable.unpaged(sort)
				: PageRequest.of(filterDto.getPage(), filterDto.getSize(), sort);

		Page<PolicyLeaveRequest> leaveRequests = policyLeaveRequestDao
			.findRequestsAssignedToManager(currentUser.getEmployee().getEmployeeId(), filterDto, pageable);

		PageDto pageDto = new PageDto();
		pageDto.setCurrentPage(leaveRequests.getNumber());
		pageDto.setTotalPages(leaveRequests.getTotalPages());
		pageDto.setTotalItems(leaveRequests.getTotalElements());
		pageDto.setItems(policyLeaveReviewMapper
			.policyLeaveRequestListToPolicyLeaveRequestManagerResponseDtoList(leaveRequests.getContent()));

		log.info("getPolicyLeaveRequestsAssignedToManager: execution ended");
		return new ResponseEntityDto(false, pageDto);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getPendingPolicyLeaveRequestsAssignedToManager(String searchKeyword) {
		log.info("getPendingPolicyLeaveRequestsAssignedToManager: execution started");
		requireLeavePoliciesEnabled();

		User currentUser = userService.getCurrentUser();
		List<PolicyLeaveRequest> pendingRequests = policyLeaveRequestDao
			.findPendingRequestsAssignedToManager(currentUser.getEmployee().getEmployeeId(), searchKeyword);

		log.info("getPendingPolicyLeaveRequestsAssignedToManager: execution ended");
		return new ResponseEntityDto(false, policyLeaveReviewMapper
			.policyLeaveRequestListToPolicyLeaveRequestManagerResponseDtoList(pendingRequests));
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getAssignedPolicyLeaveRequestById(@NonNull Long id) {
		log.info("getAssignedPolicyLeaveRequestById: execution started");
		requireLeavePoliciesEnabled();

		User currentUser = userService.getCurrentUser();
		PolicyLeaveRequest leaveRequest = findPolicyLeaveRequestById(id);

		if (!employeeManagerDao.existsByManagerEmployeeIdAndEmployeeEmployeeId(
				currentUser.getEmployee().getEmployeeId(), leaveRequest.getEmployee().getEmployeeId())) {
			throw new EntityNotFoundException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_REQUEST_NOT_FOUND);
		}

		log.info("getAssignedPolicyLeaveRequestById: execution ended");
		return new ResponseEntityDto(false, toDetailResponse(leaveRequest));
	}

	@Override
	@Transactional
	public ResponseEntityDto updatePolicyLeaveRequestByManager(@NonNull Long id,
			@NonNull PolicyLeaveReviewRequestDto reviewRequestDto) {
		log.info("updatePolicyLeaveRequestByManager: execution started");
		requireLeavePoliciesEnabled();

		User currentUser = userService.getCurrentUser();
		Employee currentEmployee = currentUser.getEmployee();

		// The lock has to be the first load of the row: if a scoping query reads the
		// entity first, the persistence context hands back that unlocked instance and
		// the SELECT ... FOR UPDATE guards nothing.
		PolicyLeaveRequest leaveRequest = lockPolicyLeaveRequestById(id);
		authorizeReviewer(leaveRequest, currentEmployee);

		LeaveRequestStatus targetStatus = reviewRequestDto.getStatus();
		validateTransition(MANAGER_TRANSITIONS, leaveRequest.getStatus(), targetStatus,
				LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_INVALID_STATUS_TRANSITION_MANAGER);
		validateReviewerComment(reviewRequestDto.getReviewerComment());

		leaveRequest.setReviewerComment(StringUtils.trimToNull(reviewRequestDto.getReviewerComment()));
		leaveRequest.setStatus(targetStatus);
		leaveRequest.setReviewer(currentEmployee);
		leaveRequest.setReviewedDate(DateTimeUtils.getCurrentUtcDateTime());

		PolicyLeaveRequest savedLeaveRequest = policyLeaveRequestDao.save(leaveRequest);
		notifyReviewOutcome(savedLeaveRequest);

		log.info("updatePolicyLeaveRequestByManager: execution ended");
		return new ResponseEntityDto(false, toDetailResponse(savedLeaveRequest));
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getMyPolicyLeaveRequestById(@NonNull Long id) {
		log.info("getMyPolicyLeaveRequestById: execution started");
		requireLeavePoliciesEnabled();

		User currentUser = userService.getCurrentUser();
		PolicyLeaveRequest leaveRequest = findPolicyLeaveRequestById(id);
		authorizeOwner(leaveRequest, currentUser.getEmployee());

		log.info("getMyPolicyLeaveRequestById: execution ended");
		return new ResponseEntityDto(false, toDetailResponse(leaveRequest));
	}

	@Override
	@Transactional
	public ResponseEntityDto updatePolicyLeaveRequestByEmployee(@NonNull Long id,
			@NonNull PolicyLeaveCancelRequestDto cancelRequestDto) {
		log.info("updatePolicyLeaveRequestByEmployee: execution started");
		requireLeavePoliciesEnabled();

		User currentUser = userService.getCurrentUser();

		PolicyLeaveRequest leaveRequest = lockPolicyLeaveRequestById(id);
		authorizeOwner(leaveRequest, currentUser.getEmployee());

		validateTransition(EMPLOYEE_TRANSITIONS, leaveRequest.getStatus(), cancelRequestDto.getStatus(),
				LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_INVALID_STATUS_TRANSITION_EMPLOYEE);

		leaveRequest.setStatus(cancelRequestDto.getStatus());

		PolicyLeaveRequest savedLeaveRequest = policyLeaveRequestDao.save(leaveRequest);
		policyLeaveReviewNotificationService.sendCancelledPolicyLeaveRequestNotifications(savedLeaveRequest);

		log.info("updatePolicyLeaveRequestByEmployee: execution ended");
		return new ResponseEntityDto(false, toDetailResponse(savedLeaveRequest));
	}

	/**
	 * Re-notifies the requester's managers about a request still awaiting review. Mirrors
	 * the legacy {@code nudgeManagers}: only the employee who raised the request may
	 * nudge, and a request that has already been decided cannot be nudged.
	 */
	@Override
	@Transactional
	public ResponseEntityDto nudgePolicyLeaveRequestManagers(@NonNull Long id) {
		log.info("nudgePolicyLeaveRequestManagers: execution started");
		requireLeavePoliciesEnabled();

		User currentUser = userService.getCurrentUser();
		PolicyLeaveRequest leaveRequest = findPolicyLeaveRequestById(id);
		authorizeOwner(leaveRequest, currentUser.getEmployee());

		if (leaveRequest.getStatus() != LeaveRequestStatus.PENDING) {
			throw new ModuleException(
					LeaveMessageConstant.LEAVE_ERROR_UNABLE_TO_NUDGE_PRE_APPROVED_DENIED_LEAVE_REQUEST);
		}

		policyLeaveReviewNotificationService.sendNudgePolicyLeaveRequestManagerNotifications(leaveRequest);

		log.info("nudgePolicyLeaveRequestManagers: execution ended");
		return new ResponseEntityDto(messageUtil.getMessage(LeaveMessageConstant.LEAVE_SUCCESS_NUDGE_MANAGER), false);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getPolicyLeaveRequestNudgeStatus(@NonNull Long id) {
		log.info("getPolicyLeaveRequestNudgeStatus: execution started");
		requireLeavePoliciesEnabled();

		User currentUser = userService.getCurrentUser();
		PolicyLeaveRequest leaveRequest = findPolicyLeaveRequestById(id);
		authorizeOwner(leaveRequest, currentUser.getEmployee());

		Notification lastNudge = notificationDao.findFirstByResourceIdAndNotificationTypeOrderByCreatedDateDesc(
				String.valueOf(id), NotificationType.LEAVE_REQUEST_NUDGE);

		LeaveNotificationNudgeResponseDto nudgeStatus = new LeaveNotificationNudgeResponseDto();
		if (lastNudge == null) {
			nudgeStatus.setIsNudge(true);
		}
		else {
			nudgeStatus.setIsNudge(isNudgeAllowed(lastNudge.getCreatedDate()));
			nudgeStatus.setLastNudgedDateTime(lastNudge.getCreatedDate());
		}

		log.info("getPolicyLeaveRequestNudgeStatus: execution ended");
		return new ResponseEntityDto(false, nudgeStatus);
	}

	private boolean isNudgeAllowed(LocalDateTime lastNudgedDateTime) {
		Duration sinceLastNudge = Duration.between(lastNudgedDateTime, DateTimeUtils.getCurrentUtcDateTime());
		return sinceLastNudge.toHours() >= LeaveModuleConstant.HOURS_PER_DAY;
	}

	private void notifyReviewOutcome(PolicyLeaveRequest leaveRequest) {
		switch (leaveRequest.getStatus()) {
			case APPROVED ->
				policyLeaveReviewNotificationService.sendApprovedPolicyLeaveRequestNotifications(leaveRequest);
			case DENIED ->
				policyLeaveReviewNotificationService.sendDeclinedPolicyLeaveRequestNotifications(leaveRequest);
			case REVOKED ->
				policyLeaveReviewNotificationService.sendRevokedPolicyLeaveRequestNotifications(leaveRequest);
			default -> log.debug("notifyReviewOutcome: no notification configured for this status");
		}
	}

	private PolicyLeaveRequest findPolicyLeaveRequestById(Long id) {
		return policyLeaveRequestDao.findById(id)
			.orElseThrow(
					() -> new EntityNotFoundException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_REQUEST_NOT_FOUND));
	}

	private PolicyLeaveRequest lockPolicyLeaveRequestById(Long id) {
		return policyLeaveRequestDao.findByIdForUpdate(id)
			.orElseThrow(
					() -> new EntityNotFoundException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_REQUEST_NOT_FOUND));
	}

	private void authorizeOwner(PolicyLeaveRequest leaveRequest, Employee currentEmployee) {
		if (!leaveRequest.getEmployee().getEmployeeId().equals(currentEmployee.getEmployeeId())) {
			throw new EntityNotFoundException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_REQUEST_NOT_FOUND);
		}
	}

	/**
	 * A reviewer must be linked to the requester. Unlike the legacy flow, which rejects
	 * anyone holding <em>any</em> INFORMANT row, only a reviewer whose links are
	 * <em>all</em> INFORMANT is rejected, so a manager who is both PRIMARY and INFORMANT
	 * can still act.
	 */
	private void authorizeReviewer(PolicyLeaveRequest leaveRequest, Employee currentEmployee) {
		List<EmployeeManager> links = employeeManagerDao.findByEmployee(leaveRequest.getEmployee())
			.stream()
			.filter(employeeManager -> employeeManager.getManager()
				.getEmployeeId()
				.equals(currentEmployee.getEmployeeId()))
			.toList();

		if (links.isEmpty()) {
			throw new EntityNotFoundException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_REQUEST_NOT_FOUND);
		}

		boolean hasActionableLink = links.stream()
			.anyMatch(employeeManager -> employeeManager.getManagerType() != ManagerType.INFORMANT);
		if (!hasActionableLink) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_INFORMANT_CANNOT_REVIEW);
		}
	}

	private void validateTransition(Map<LeaveRequestStatus, Set<LeaveRequestStatus>> allowedTransitions,
			LeaveRequestStatus currentStatus, LeaveRequestStatus targetStatus, LeaveMessageConstant messageConstant) {
		if (currentStatus == targetStatus) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_ALREADY_IN_STATUS);
		}
		if (!allowedTransitions.getOrDefault(currentStatus, Set.of()).contains(targetStatus)) {
			throw new ModuleException(messageConstant);
		}
	}

	private void validateReviewerComment(String reviewerComment) {
		if (reviewerComment != null
				&& reviewerComment.trim().length() > PolicyLeaveConstant.MAX_REVIEWER_COMMENT_LENGTH) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_REVIEWER_COMMENT_MAX_LENGTH);
		}
	}

	private PolicyLeaveRequestManagerDetailResponseDto toDetailResponse(PolicyLeaveRequest leaveRequest) {
		return policyLeaveReviewMapper.policyLeaveRequestToPolicyLeaveRequestManagerDetailResponseDto(leaveRequest);
	}

	private void requireLeavePoliciesEnabled() {
		if (!leavePolicyService.isLeavePoliciesEnabled()) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_NOT_ENABLED);
		}
	}

	private static Map<LeaveRequestStatus, Set<LeaveRequestStatus>> buildManagerTransitions() {
		Map<LeaveRequestStatus, Set<LeaveRequestStatus>> transitions = new EnumMap<>(LeaveRequestStatus.class);
		transitions.put(LeaveRequestStatus.PENDING, Set.of(LeaveRequestStatus.APPROVED, LeaveRequestStatus.DENIED));
		transitions.put(LeaveRequestStatus.APPROVED, Set.of(LeaveRequestStatus.REVOKED));
		return Map.copyOf(transitions);
	}

	private static Map<LeaveRequestStatus, Set<LeaveRequestStatus>> buildEmployeeTransitions() {
		Map<LeaveRequestStatus, Set<LeaveRequestStatus>> transitions = new EnumMap<>(LeaveRequestStatus.class);
		transitions.put(LeaveRequestStatus.PENDING, Set.of(LeaveRequestStatus.CANCELLED));
		return Map.copyOf(transitions);
	}

}
