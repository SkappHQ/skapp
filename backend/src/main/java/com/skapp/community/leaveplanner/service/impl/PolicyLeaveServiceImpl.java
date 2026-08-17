package com.skapp.community.leaveplanner.service.impl;

import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.Notification;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.repository.NotificationDao;
import com.skapp.community.common.service.EmailService;
import com.skapp.community.common.service.NotificationService;
import com.skapp.community.common.service.OrganizationService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.EmailBodyTemplates;
import com.skapp.community.common.type.NotificationCategory;
import com.skapp.community.common.type.NotificationType;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.leaveplanner.constant.LeaveMessageConstant;
import com.skapp.community.leaveplanner.constant.LeaveModuleConstant;
import com.skapp.community.leaveplanner.constant.PolicyLeaveConstant;
import com.skapp.community.leaveplanner.mapper.LeaveMapper;
import com.skapp.community.leaveplanner.model.EmployeeLeavePolicy;
import com.skapp.community.leaveplanner.model.LeavePolicy;
import com.skapp.community.leaveplanner.model.PolicyLeaveRequest;
import com.skapp.community.leaveplanner.model.PolicyLeaveRequestAttachment;
import com.skapp.community.leaveplanner.model.PolicyLeaveType;
import com.skapp.community.leaveplanner.payload.PolicyLeaveBalanceDto;
import com.skapp.community.leaveplanner.payload.email.LeaveEmailDynamicFields;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveAttachmentDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveAvailabilityRequestDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveRequestDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveRequestFilterDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveRequestUpdateDto;
import com.skapp.community.leaveplanner.payload.response.EmployeePolicyBalanceResponseDto;
import com.skapp.community.leaveplanner.payload.response.LeaveNotificationNudgeResponseDto;
import com.skapp.community.leaveplanner.payload.response.PolicyLeaveAvailabilityResponseDto;
import com.skapp.community.leaveplanner.payload.response.PolicyLeaveRequestResponseDto;
import com.skapp.community.leaveplanner.repository.EmployeeLeavePolicyDao;
import com.skapp.community.leaveplanner.repository.PolicyLeaveRequestDao;
import com.skapp.community.leaveplanner.service.LeaveEmailService;
import com.skapp.community.leaveplanner.service.LeaveNotificationService;
import com.skapp.community.leaveplanner.service.LeavePolicyService;
import com.skapp.community.leaveplanner.service.PolicyLeaveBalanceService;
import com.skapp.community.leaveplanner.service.PolicyLeaveService;
import com.skapp.community.leaveplanner.type.EmployeeLeavePolicyStatus;
import com.skapp.community.leaveplanner.type.LeaveDuration;
import com.skapp.community.leaveplanner.type.LeavePolicyStatus;
import com.skapp.community.leaveplanner.type.LeaveRequestSort;
import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import com.skapp.community.leaveplanner.type.LeaveState;
import com.skapp.community.leaveplanner.type.ManagerType;
import com.skapp.community.leaveplanner.type.PolicyBalanceDisabledReason;
import com.skapp.community.leaveplanner.type.PolicyLeaveValidationFailure;
import com.skapp.community.leaveplanner.util.LeaveModuleUtil;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeManager;
import com.skapp.community.peopleplanner.model.Holiday;
import com.skapp.community.peopleplanner.payload.response.EmployeeManagerResponseDto;
import com.skapp.community.peopleplanner.repository.EmployeeManagerDao;
import com.skapp.community.peopleplanner.repository.HolidayDao;
import com.skapp.community.peopleplanner.service.PeopleService;
import com.skapp.community.peopleplanner.util.PeopleUtil;
import com.skapp.community.peopleplanner.type.HolidayDuration;
import com.skapp.community.timeplanner.model.TimeConfig;
import com.skapp.community.timeplanner.repository.TimeConfigDao;
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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Predicate;
import java.util.function.Supplier;

@Slf4j
@Service
@RequiredArgsConstructor
public class PolicyLeaveServiceImpl implements PolicyLeaveService {

	private final UserService userService;

	private final PeopleService peopleService;

	private final OrganizationService organizationService;

	private final LeavePolicyService leavePolicyService;

	private final PolicyLeaveBalanceService policyLeaveBalanceService;

	private final PolicyLeaveRequestDao policyLeaveRequestDao;

	private final EmployeeLeavePolicyDao employeeLeavePolicyDao;

	private final EmployeeManagerDao employeeManagerDao;

	private final HolidayDao holidayDao;

	private final TimeConfigDao timeConfigDao;

	private final LeaveMapper leaveMapper;

	private final LeaveEmailService leaveEmailService;

	private final LeaveNotificationService leaveNotificationService;

	private final EmailService emailService;

	private final NotificationService notificationService;

	private final NotificationDao notificationDao;

	private final MessageUtil messageUtil;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getCurrentUserPolicyBalances(Integer year) {
		log.info("getCurrentUserPolicyBalances: execution started");
		requireLeavePoliciesEnabled();

		User currentUser = userService.getCurrentUser();
		int resolvedYear = resolveYear(year);
		boolean hasSupervisor = !peopleService.getCurrentEmployeeManagers().isEmpty();
		LocalDate today = DateTimeUtils.getCurrentUtcDate();

		List<EmployeeLeavePolicy> assignments = employeeLeavePolicyDao
			.findByEmployee_EmployeeIdAndStatusOrderByPolicy_NameAsc(currentUser.getEmployee().getEmployeeId(),
					EmployeeLeavePolicyStatus.ACTIVE);

		List<EmployeePolicyBalanceResponseDto> balances = assignments.stream()
			.map(assignment -> toBalanceCard(assignment, resolvedYear, hasSupervisor, today))
			.toList();

		log.info("getCurrentUserPolicyBalances: execution ended");
		return new ResponseEntityDto(false, balances);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto checkPolicyLeaveAvailability(@NonNull PolicyLeaveAvailabilityRequestDto requestDto) {
		log.info("checkPolicyLeaveAvailability: execution started");
		requireLeavePoliciesEnabled();

		User currentUser = userService.getCurrentUser();
		EmployeeLeavePolicy assignment = resolveActiveAssignment(currentUser.getEmployee(), requestDto.getPolicyId());
		PolicyLeaveBalanceDto balance = policyLeaveBalanceService.calculateBalanceForDate(assignment,
				requestDto.getStartDate());

		PolicyLeaveAvailabilityResponseDto responseDto = new PolicyLeaveAvailabilityResponseDto();
		responseDto.setPolicyId(assignment.getPolicy().getId());
		responseDto.setPolicyName(assignment.getPolicy().getName());
		responseDto.setRemainingBalance(balance.getBalanceInDays());
		responseDto.setIsUnlimited(balance.isUnlimited());
		responseDto.setValidFrom(balance.getUsableFrom());
		responseDto.setValidTo(balance.getCycleEnd());
		responseDto.setRequestedDays(0f);

		PolicyLeaveValidationFailure failure = firstFailure(currentUser.getEmployee(), balance,
				requestDto.getStartDate(), requestDto.getEndDate(), requestDto.getLeaveState(), responseDto);

		responseDto.setIsValid(failure == null);
		responseDto.setFailureReason(failure);
		if (failure == null && !balance.isUnlimited()) {
			responseDto.setBalanceAfterRequest(balance.getBalanceInDays() - responseDto.getRequestedDays());
		}

		log.info("checkPolicyLeaveAvailability: execution ended");
		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	@Transactional
	public ResponseEntityDto applyPolicyLeaveRequest(@NonNull PolicyLeaveRequestDto policyLeaveRequestDto) {
		log.info("applyPolicyLeaveRequest: execution started");
		requireLeavePoliciesEnabled();

		User currentUser = userService.getCurrentUser();
		Employee employee = currentUser.getEmployee();

		List<EmployeeManagerResponseDto> managers = peopleService.getCurrentEmployeeManagers();
		if (managers.isEmpty()) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_NO_MANAGER_FOUND);
		}

		EmployeeLeavePolicy assignment = resolveActiveAssignment(employee, policyLeaveRequestDto.getPolicyId());
		LeavePolicy policy = assignment.getPolicy();
		validatePolicyIsUsable(policy);
		validateAgainstLeaveType(policy.getLeaveType(), policyLeaveRequestDto);

		PolicyLeaveBalanceDto balance = policyLeaveBalanceService.calculateBalanceForDate(assignment,
				policyLeaveRequestDto.getStartDate());

		float durationDays = validateAndCalculateDuration(employee, balance, policyLeaveRequestDto.getStartDate(),
				policyLeaveRequestDto.getEndDate(), policyLeaveRequestDto.getLeaveState());

		PolicyLeaveRequest leaveRequest = new PolicyLeaveRequest();
		leaveRequest.setEmployee(employee);
		leaveRequest.setPolicy(policy);
		leaveRequest.setStartDate(policyLeaveRequestDto.getStartDate());
		leaveRequest.setEndDate(policyLeaveRequestDto.getEndDate());
		leaveRequest.setLeaveState(policyLeaveRequestDto.getLeaveState());
		leaveRequest.setRequestDesc(policyLeaveRequestDto.getRequestDesc());
		leaveRequest.setDurationDays(durationDays);
		leaveRequest.setStatus(LeaveRequestStatus.PENDING);
		leaveRequest.setIsViewed(Boolean.FALSE);
		leaveRequest.setIsAutoApproved(Boolean.FALSE);
		attachSupportingDocuments(leaveRequest, policyLeaveRequestDto.getAttachments());

		List<EmployeeManager> employeeManagers = employeeManagerDao.findByEmployee(employee);
		if (Boolean.TRUE.equals(policy.getLeaveType().getIsAutoApproval())) {
			autoApprove(leaveRequest, employeeManagers);
		}

		PolicyLeaveRequest savedLeaveRequest = policyLeaveRequestDao.save(leaveRequest);

		notifyParticipants(currentUser, savedLeaveRequest, employeeManagers);

		PolicyLeaveRequestResponseDto responseDto = leaveMapper
			.policyLeaveRequestToPolicyLeaveRequestResponseDto(savedLeaveRequest);
		responseDto.setIsUnlimited(balance.isUnlimited());
		if (!balance.isUnlimited()) {
			responseDto.setRemainingBalance(balance.getBalanceInDays() - durationDays);
		}

		log.info("applyPolicyLeaveRequest: execution ended");
		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getCurrentUserPolicyLeaveRequests(@NonNull PolicyLeaveRequestFilterDto filterDto) {
		log.info("getCurrentUserPolicyLeaveRequests: execution started");
		requireLeavePoliciesEnabled();
		validatePagination(filterDto.getPage(), filterDto.getSize());

		User currentUser = userService.getCurrentUser();
		int resolvedYear = resolveYear(filterDto.getYear());

		Page<PolicyLeaveRequest> leaveRequests = policyLeaveRequestDao.findMyRequests(
				currentUser.getEmployee().getEmployeeId(), DateTimeUtils.getStartOfYear(resolvedYear),
				DateTimeUtils.getEndOfYear(resolvedYear), filterDto, resolvePageable(filterDto));

		log.info("getCurrentUserPolicyLeaveRequests: execution ended");
		return new ResponseEntityDto(false, toPageDto(leaveRequests));
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getSupervisedPolicyLeaveRequests(@NonNull PolicyLeaveRequestFilterDto filterDto) {
		log.info("getSupervisedPolicyLeaveRequests: execution started");
		requireLeavePoliciesEnabled();
		validatePagination(filterDto.getPage(), filterDto.getSize());
		validateSearchKeyword(filterDto.getSearchKeyword());

		User currentUser = userService.getCurrentUser();
		Page<PolicyLeaveRequest> leaveRequests = policyLeaveRequestDao
			.findSupervisedRequests(currentUser.getEmployee().getEmployeeId(), filterDto, resolvePageable(filterDto));

		log.info("getSupervisedPolicyLeaveRequests: execution ended");
		return new ResponseEntityDto(false, toPageDto(leaveRequests));
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getPolicyLeaveRequestById(@NonNull Long id) {
		log.info("getPolicyLeaveRequestById: execution started");
		requireLeavePoliciesEnabled();

		Employee currentEmployee = userService.getCurrentUser().getEmployee();
		PolicyLeaveRequest leaveRequest = policyLeaveRequestDao.findById(id)
			.orElseThrow(
					() -> new EntityNotFoundException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_REQUEST_NOT_FOUND));

		if (!isOwnRequest(leaveRequest, currentEmployee)
				&& !employeeManagerDao.existsByManagerEmployeeIdAndEmployeeEmployeeId(currentEmployee.getEmployeeId(),
						leaveRequest.getEmployee().getEmployeeId())) {
			throw new EntityNotFoundException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_REQUEST_NOT_FOUND);
		}

		log.info("getPolicyLeaveRequestById: execution ended");
		return new ResponseEntityDto(false,
				leaveMapper.policyLeaveRequestToPolicyLeaveRequestResponseDto(leaveRequest));
	}

	@Override
	@Transactional
	public ResponseEntityDto updatePolicyLeaveRequest(@NonNull Long id,
			@NonNull PolicyLeaveRequestUpdateDto updateDto) {
		log.info("updatePolicyLeaveRequest: execution started for request: {}", id);
		requireLeavePoliciesEnabled();

		Employee currentEmployee = userService.getCurrentUser().getEmployee();

		PolicyLeaveRequest leaveRequest = policyLeaveRequestDao.findByIdForUpdate(id)
			.orElseThrow(
					() -> new EntityNotFoundException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_REQUEST_NOT_FOUND));

		LeaveRequestStatus targetStatus = updateDto.getStatus();

		if (isOwnRequest(leaveRequest, currentEmployee)) {
			validateTransition(PolicyLeaveConstant.OWNER_STATUS_TRANSITIONS, leaveRequest.getStatus(), targetStatus,
					LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_INVALID_STATUS_TRANSITION_EMPLOYEE);
			leaveRequest.setStatus(targetStatus);

			PolicyLeaveRequest cancelledLeaveRequest = policyLeaveRequestDao.save(leaveRequest);
			notifyCancelledLeaveRequest(cancelledLeaveRequest);

			log.info("updatePolicyLeaveRequest: execution ended for request: {}", id);
			return new ResponseEntityDto(false,
					leaveMapper.policyLeaveRequestToPolicyLeaveRequestResponseDto(cancelledLeaveRequest));
		}

		authorizeReviewer(leaveRequest, currentEmployee);
		validateTransition(PolicyLeaveConstant.REVIEWER_STATUS_TRANSITIONS, leaveRequest.getStatus(), targetStatus,
				LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_INVALID_STATUS_TRANSITION_MANAGER);
		validateReviewerComment(updateDto.getReviewerComment());

		if (StringUtils.isNotBlank(updateDto.getReviewerComment())) {
			leaveRequest.setReviewerComment(updateDto.getReviewerComment().trim());
		}
		leaveRequest.setStatus(targetStatus);
		leaveRequest.setReviewer(currentEmployee);
		leaveRequest.setReviewedDate(DateTimeUtils.getCurrentUtcDateTime());

		PolicyLeaveRequest reviewedLeaveRequest = policyLeaveRequestDao.save(leaveRequest);
		notifyReviewedLeaveRequest(reviewedLeaveRequest);

		log.info("updatePolicyLeaveRequest: execution ended for request: {}", id);
		return new ResponseEntityDto(false,
				leaveMapper.policyLeaveRequestToPolicyLeaveRequestResponseDto(reviewedLeaveRequest));
	}

	@Override
	@Transactional
	public ResponseEntityDto nudgePolicyLeaveRequestManagers(@NonNull Long id) {
		log.info("nudgePolicyLeaveRequestManagers: execution started");
		requireLeavePoliciesEnabled();

		Employee currentEmployee = userService.getCurrentUser().getEmployee();
		PolicyLeaveRequest leaveRequest = policyLeaveRequestDao.findById(id)
			.orElseThrow(
					() -> new EntityNotFoundException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_REQUEST_NOT_FOUND));

		if (!isOwnRequest(leaveRequest, currentEmployee)) {
			throw new EntityNotFoundException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_REQUEST_NOT_FOUND);
		}

		if (leaveRequest.getStatus() != LeaveRequestStatus.PENDING) {
			throw new ModuleException(
					LeaveMessageConstant.LEAVE_ERROR_UNABLE_TO_NUDGE_PRE_APPROVED_DENIED_LEAVE_REQUEST);
		}

		Notification lastNudge = findLastNudge(id);
		if (lastNudge != null && !isNudgeAllowed(lastNudge.getCreatedDate())) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_NUDGE_TOO_SOON);
		}

		notifyNudgedLeaveRequest(leaveRequest);

		log.info("nudgePolicyLeaveRequestManagers: execution ended");
		return new ResponseEntityDto(messageUtil.getMessage(LeaveMessageConstant.LEAVE_SUCCESS_NUDGE_MANAGER), false);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getPolicyLeaveRequestNudgeStatus(@NonNull Long id) {
		log.info("getPolicyLeaveRequestNudgeStatus: execution started");
		requireLeavePoliciesEnabled();

		Employee currentEmployee = userService.getCurrentUser().getEmployee();
		PolicyLeaveRequest leaveRequest = policyLeaveRequestDao.findById(id)
			.orElseThrow(
					() -> new EntityNotFoundException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_REQUEST_NOT_FOUND));

		if (!isOwnRequest(leaveRequest, currentEmployee)) {
			throw new EntityNotFoundException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_REQUEST_NOT_FOUND);
		}

		Notification lastNudge = findLastNudge(id);

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

	private Notification findLastNudge(Long id) {
		return notificationDao.findFirstByResourceIdAndNotificationTypeOrderByCreatedDateDesc(String.valueOf(id),
				NotificationType.LEAVE_REQUEST_NUDGE);
	}

	private boolean isNudgeAllowed(LocalDateTime lastNudgedDateTime) {
		Duration sinceLastNudge = Duration.between(lastNudgedDateTime, DateTimeUtils.getCurrentUtcDateTime());
		return sinceLastNudge.toHours() >= LeaveModuleConstant.HOURS_PER_DAY;
	}

	private Pageable resolvePageable(PolicyLeaveRequestFilterDto filterDto) {
		LeaveRequestSort sortKey = filterDto.getSortKey() == null ? LeaveRequestSort.CREATED_DATE
				: filterDto.getSortKey();
		Sort.Direction sortOrder = filterDto.getSortOrder() == null ? Sort.Direction.DESC : filterDto.getSortOrder();
		Sort sort = Sort.by(sortOrder, sortKey.toString());

		return filterDto.getSize() < 0 ? Pageable.unpaged(sort)
				: PageRequest.of(filterDto.getPage(), filterDto.getSize(), sort);
	}

	private PageDto toPageDto(Page<PolicyLeaveRequest> leaveRequests) {
		PageDto pageDto = new PageDto();
		pageDto.setCurrentPage(leaveRequests.getNumber());
		pageDto.setTotalPages(leaveRequests.getTotalPages());
		pageDto.setTotalItems(leaveRequests.getTotalElements());
		pageDto.setItems(
				leaveMapper.policyLeaveRequestListToPolicyLeaveRequestResponseDtoList(leaveRequests.getContent()));
		return pageDto;
	}

	private boolean isOwnRequest(PolicyLeaveRequest leaveRequest, Employee currentEmployee) {
		return leaveRequest.getEmployee().getEmployeeId().equals(currentEmployee.getEmployeeId());
	}

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

	private void validatePagination(int page, int size) {
		if (page < 0) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_INVALID_PAGE);
		}

		if (size == 0) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_INVALID_PAGE_SIZE);
		}
	}

	private void validateSearchKeyword(String searchKeyword) {
		if (searchKeyword != null && searchKeyword.length() > PolicyLeaveConstant.MAX_SEARCH_KEYWORD_LENGTH) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_SEARCH_KEYWORD_MAX_LENGTH);
		}
	}

	private void validateReviewerComment(String reviewerComment) {
		if (reviewerComment != null
				&& reviewerComment.trim().length() > PolicyLeaveConstant.MAX_REVIEWER_COMMENT_LENGTH) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_REVIEWER_COMMENT_MAX_LENGTH);
		}
	}

	private EmployeePolicyBalanceResponseDto toBalanceCard(EmployeeLeavePolicy assignment, int year,
			boolean hasSupervisor, LocalDate today) {
		LeavePolicy policy = assignment.getPolicy();
		PolicyLeaveBalanceDto balance = policyLeaveBalanceService.calculateBalanceForYear(assignment, year);

		EmployeePolicyBalanceResponseDto card = new EmployeePolicyBalanceResponseDto();
		card.setAssignmentId(assignment.getId());
		card.setPolicyId(policy.getId());
		card.setPolicyName(policy.getName());
		card.setPolicyType(policy.getPolicyType());
		card.setLeaveType(leaveMapper.policyLeaveTypeToPolicyLeaveTypeDetailResponseDto(policy.getLeaveType()));
		card.setYear(year);
		card.setEffectiveFrom(balance.getEffectiveFrom());
		card.setValidFrom(balance.getUsableFrom());
		card.setValidTo(balance.getCycleEnd());
		card.setAccruedDays(balance.getAccruedDays());
		card.setTotalDaysAllocated(balance.getTotalDaysAllocated());
		card.setTotalDaysUsed(balance.getTotalDaysUsed());
		card.setBalanceInDays(balance.getBalanceInDays());
		card.setIsUnlimited(balance.isUnlimited());
		card.setIsBalanceAvailable(balance.isDerived());

		PolicyBalanceDisabledReason disabledReason = resolveDisabledReason(balance, hasSupervisor, today);
		card.setDisabledReason(disabledReason);
		card.setIsDisabled(disabledReason != null);
		return card;
	}

	private PolicyBalanceDisabledReason resolveDisabledReason(PolicyLeaveBalanceDto balance, boolean hasSupervisor,
			LocalDate today) {
		if (balance.getPolicy().getStatus() != LeavePolicyStatus.ACTIVE) {
			return PolicyBalanceDisabledReason.POLICY_INACTIVE;
		}
		if (balance.getCycleEnd().isBefore(today)) {
			return PolicyBalanceDisabledReason.ALLOCATION_PERIOD_EXPIRED;
		}
		if (!hasBalance(balance)) {
			return PolicyBalanceDisabledReason.FULLY_UTILIZED;
		}
		if (!hasSupervisor) {
			return PolicyBalanceDisabledReason.NO_SUPERVISOR_ASSIGNED;
		}
		return null;
	}

	private PolicyLeaveValidationFailure firstFailure(Employee employee, PolicyLeaveBalanceDto balance,
			LocalDate startDate, LocalDate endDate, LeaveState leaveState,
			PolicyLeaveAvailabilityResponseDto responseDto) {
		if (endDate.isBefore(startDate)) {
			return PolicyLeaveValidationFailure.INVALID_DATE_RANGE;
		}
		if (startDate.isBefore(balance.getUsableFrom()) || endDate.isAfter(balance.getCycleEnd())) {
			return PolicyLeaveValidationFailure.OUTSIDE_POLICY_PERIOD;
		}

		List<Holiday> holidays = getHolidaysForEmployee(employee);
		if (conflictsWithHoliday(startDate, endDate, leaveState, holidays)) {
			return PolicyLeaveValidationFailure.NO_WORKING_DAYS;
		}

		float requestedDays = calculateRequestedDays(startDate, endDate, leaveState, holidays);
		responseDto.setRequestedDays(requestedDays);
		if (requestedDays <= 0f) {
			return PolicyLeaveValidationFailure.NO_WORKING_DAYS;
		}
		if (hasOverlappingRequest(employee, startDate, endDate, leaveState)) {
			return PolicyLeaveValidationFailure.OVERLAPPING_REQUEST;
		}
		if (!canAccommodate(balance, requestedDays)) {
			return PolicyLeaveValidationFailure.INSUFFICIENT_BALANCE;
		}
		return null;
	}

	private boolean hasBalance(PolicyLeaveBalanceDto balance) {
		return balance.isUnlimited() || balance.getBalanceInDays() > 0f;
	}

	private boolean canAccommodate(PolicyLeaveBalanceDto balance, float requestedDays) {
		return balance.isUnlimited() || requestedDays <= balance.getBalanceInDays();
	}

	private float validateAndCalculateDuration(Employee employee, PolicyLeaveBalanceDto balance, LocalDate startDate,
			LocalDate endDate, LeaveState leaveState) {
		if (endDate.isBefore(startDate)) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_INVALID_DATE_RANGE);
		}
		if (startDate.isBefore(balance.getUsableFrom()) || endDate.isAfter(balance.getCycleEnd())) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_OUTSIDE_POLICY_PERIOD);
		}

		List<Holiday> holidays = getHolidaysForEmployee(employee);
		if (conflictsWithHoliday(startDate, endDate, leaveState, holidays)) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_NOT_APPLICABLE);
		}

		float requestedDays = calculateRequestedDays(startDate, endDate, leaveState, holidays);
		if (requestedDays <= 0f) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_NOT_APPLICABLE);
		}
		if (hasOverlappingRequest(employee, startDate, endDate, leaveState)) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_REQUEST_OVERLAP);
		}
		if (!canAccommodate(balance, requestedDays)) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_INSUFFICIENT_BALANCE,
					new Object[] { balance.getBalanceInDays(), balance.getPolicy().getName() });
		}
		return requestedDays;
	}

	private void validatePolicyIsUsable(LeavePolicy policy) {
		if (policy.getStatus() != LeavePolicyStatus.ACTIVE) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_POLICY_INACTIVE);
		}
		if (!Boolean.TRUE.equals(policy.getLeaveType().getIsActive())) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_TYPE_INACTIVE);
		}
	}

	private void validateAgainstLeaveType(PolicyLeaveType leaveType, PolicyLeaveRequestDto requestDto) {
		if (Boolean.TRUE.equals(leaveType.getIsCommentMust()) && StringUtils.isBlank(requestDto.getRequestDesc())) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_MUST_INCLUDE_COMMENT);
		}
		if (Boolean.TRUE.equals(leaveType.getIsAttachmentMust())
				&& (requestDto.getAttachments() == null || requestDto.getAttachments().isEmpty())) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_MUST_INCLUDE_ATTACHMENT);
		}
		if (requestDto.getAttachments() != null && !requestDto.getAttachments().isEmpty()) {
			if (!Boolean.TRUE.equals(leaveType.getIsAttachment())) {
				throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_ATTACHMENTS_NOT_ALLOWED);
			}
			if (requestDto.getAttachments().size() > PolicyLeaveConstant.MAX_ATTACHMENTS) {
				throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_TOO_MANY_ATTACHMENTS);
			}
			validateAttachmentUrls(requestDto.getAttachments());
		}
		if (leaveType.getMinDuration() == LeaveDuration.FULL_DAY && isHalfDay(requestDto.getLeaveState())) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_CANNOT_APPLY_HALFDAY);
		}
		if (leaveType.getMinDuration() == LeaveDuration.HALF_DAY && requestDto.getLeaveState() == LeaveState.FULLDAY) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_CANNOT_APPLY_FULLDAY);
		}
		if (isHalfDay(requestDto.getLeaveState()) && !requestDto.getStartDate().equals(requestDto.getEndDate())) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_HALFDAY_SINGLE_DATE_ONLY);
		}
		if (requestDto.getRequestDesc() != null
				&& requestDto.getRequestDesc().length() > PolicyLeaveConstant.MAX_REQUEST_DESCRIPTION_LENGTH) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_DESCRIPTION_MAX_LENGTH);
		}
	}

	private void validateAttachmentUrls(List<PolicyLeaveAttachmentDto> attachmentDtos) {
		boolean hasOversizedUrl = attachmentDtos.stream()
			.filter(dto -> dto != null && dto.getFileUrl() != null)
			.anyMatch(dto -> dto.getFileUrl().length() > PolicyLeaveConstant.MAX_ATTACHMENT_URL_LENGTH);
		if (hasOversizedUrl) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_ATTACHMENT_URL_MAX_LENGTH);
		}
	}

	private boolean hasOverlappingRequest(Employee employee, LocalDate startDate, LocalDate endDate,
			LeaveState leaveState) {
		List<PolicyLeaveRequest> overlapping = policyLeaveRequestDao.findOverlappingRequests(employee.getEmployeeId(),
				PolicyLeaveConstant.BALANCE_HOLDING_STATUSES, startDate, endDate);
		if (overlapping.isEmpty()) {
			return false;
		}
		if (!isHalfDay(leaveState)) {
			return true;
		}
		return overlapping.stream()
			.anyMatch(existing -> !isHalfDay(existing.getLeaveState()) || existing.getLeaveState() == leaveState);
	}

	private float calculateRequestedDays(LocalDate startDate, LocalDate endDate, LeaveState leaveState,
			List<Holiday> holidays) {
		List<TimeConfig> timeConfigs = timeConfigDao.findAll();
		float workingDays = LeaveModuleUtil.getWorkingDaysBetweenTwoDates(startDate, endDate, timeConfigs, holidays,
				organizationService.getOrganizationTimeZone());
		if (workingDays == 1f && isHalfDay(leaveState)) {
			return LeaveModuleConstant.HALF_DAY;
		}
		return workingDays;
	}

	private boolean conflictsWithHoliday(LocalDate startDate, LocalDate endDate, LeaveState leaveState,
			List<Holiday> holidays) {
		boolean isSingleDay = startDate.equals(endDate);
		HolidayDuration holidayDuration = isSingleDay
				? LeaveModuleUtil.getHolidayAvailabilityOnGivenDate(startDate, holidays)
				: LeaveModuleUtil.getHolidayAvailabilityOnGivenDateRange(startDate, endDate, holidays);

		if (holidayDuration == null || holidayDuration == HolidayDuration.FULL_DAY) {
			return false;
		}

		if (!isSingleDay) {
			return false;
		}
		if (leaveState == LeaveState.FULLDAY) {
			return true;
		}
		return (holidayDuration == HolidayDuration.HALF_DAY_MORNING && leaveState == LeaveState.HALFDAY_MORNING)
				|| (holidayDuration == HolidayDuration.HALF_DAY_EVENING && leaveState == LeaveState.HALFDAY_EVENING);
	}

	private void requireLeavePoliciesEnabled() {
		if (!leavePolicyService.isLeavePoliciesEnabled()) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_NOT_ENABLED);
		}
	}

	private EmployeeLeavePolicy resolveActiveAssignment(Employee employee, Long policyId) {
		return employeeLeavePolicyDao
			.findByEmployee_EmployeeIdAndPolicy_IdAndStatus(employee.getEmployeeId(), policyId,
					EmployeeLeavePolicyStatus.ACTIVE)
			.orElseThrow(() -> new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_POLICY_NOT_ASSIGNED));
	}

	private void attachSupportingDocuments(PolicyLeaveRequest leaveRequest,
			List<PolicyLeaveAttachmentDto> attachmentDtos) {
		if (attachmentDtos == null || attachmentDtos.isEmpty()) {
			return;
		}

		List<PolicyLeaveRequestAttachment> attachments = attachmentDtos.stream()
			.filter(dto -> dto != null && StringUtils.isNotBlank(dto.getFileUrl()))
			.filter(distinctByFileUrl())
			.map(dto -> new PolicyLeaveRequestAttachment(leaveRequest, dto.getFileUrl(), dto.getOriginalFileName()))
			.toList();

		leaveRequest.setAttachments(attachments);
	}

	private Predicate<PolicyLeaveAttachmentDto> distinctByFileUrl() {
		Set<String> seen = new HashSet<>();
		return dto -> seen.add(dto.getFileUrl());
	}

	private void autoApprove(PolicyLeaveRequest leaveRequest, List<EmployeeManager> employeeManagers) {
		leaveRequest.setStatus(LeaveRequestStatus.APPROVED);
		leaveRequest.setIsAutoApproved(Boolean.TRUE);
		leaveRequest.setReviewedDate(DateTimeUtils.getCurrentUtcDateTime());
		if (!employeeManagers.isEmpty()) {
			leaveRequest.setReviewer(employeeManagers.getFirst().getManager());
		}
	}

	private void notifyParticipants(User currentUser, PolicyLeaveRequest leaveRequest,
			List<EmployeeManager> employeeManagers) {
		Employee employee = currentUser.getEmployee();
		boolean isSingleDay = leaveRequest.getStartDate().equals(leaveRequest.getEndDate());
		String leaveTypeName = leaveRequest.getPolicy().getLeaveType().getName();

		leaveEmailService.sendApplyLeaveRequestEmployeeEmail(employee.getFirstName(), employee.getLastName(),
				currentUser.getEmail(), leaveTypeName, leaveRequest.getStartDate(), leaveRequest.getEndDate(),
				leaveRequest.getLeaveState().toString(), leaveRequest.getRequestDesc(), isSingleDay);

		leaveNotificationService.sendApplyLeaveRequestEmployeeNotification(employee, leaveRequest.getId(),
				leaveRequest.getLeaveState().toString(), leaveTypeName, leaveRequest.getStartDate(),
				leaveRequest.getEndDate(), isSingleDay);

		if (leaveRequest.getStatus() == LeaveRequestStatus.APPROVED) {
			return;
		}

		leaveEmailService.sendReceivedLeaveRequestManagerEmail(employeeManagers, employee.getFirstName(),
				employee.getLastName(), leaveRequest.getLeaveState().toString(), leaveTypeName,
				leaveRequest.getStartDate(), leaveRequest.getEndDate(), isSingleDay);

		leaveNotificationService.sendReceivedLeaveRequestManagerNotification(employeeManagers, employee.getFirstName(),
				employee.getLastName(), leaveRequest.getId(), leaveRequest.getLeaveState().toString(), leaveTypeName,
				leaveRequest.getStartDate(), leaveRequest.getEndDate(), isSingleDay);
	}

	private void notifyReviewedLeaveRequest(PolicyLeaveRequest leaveRequest) {
		boolean isSingleDay = leaveRequest.getStartDate().equals(leaveRequest.getEndDate());

		switch (leaveRequest.getStatus()) {
			case APPROVED -> notifyReviewOutcome(leaveRequest,
					isSingleDay ? EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_APPROVED_SINGLE_DAY_LEAVE
							: EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_APPROVED_MULTI_DAY_LEAVE,
					isSingleDay ? EmailBodyTemplates.LEAVE_MODULE_MANAGER_APPROVED_SINGLE_DAY_LEAVE
							: EmailBodyTemplates.LEAVE_MODULE_MANAGER_APPROVED_MULTI_DAY_LEAVE);
			case DENIED -> notifyReviewOutcome(leaveRequest,
					isSingleDay ? EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_DECLINED_SINGLE_DAY_LEAVE
							: EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_DECLINED_MULTI_DAY_LEAVE,
					isSingleDay ? EmailBodyTemplates.LEAVE_MODULE_MANAGER_DECLINED_SINGLE_DAY_LEAVE
							: EmailBodyTemplates.LEAVE_MODULE_MANAGER_DECLINED_MULTI_DAY_LEAVE);
			case REVOKED -> notifyReviewOutcome(leaveRequest,
					isSingleDay ? EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_REVOKED_SINGLE_DAY_LEAVE
							: EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_REVOKED_MULTI_DAY_LEAVE,
					isSingleDay ? EmailBodyTemplates.LEAVE_MODULE_MANAGER_REVOKED_SINGLE_DAY_LEAVE
							: EmailBodyTemplates.LEAVE_MODULE_MANAGER_REVOKED_MULTI_DAY_LEAVE);
			default ->
				log.debug("notifyReviewedLeaveRequest: no notification for status: {}", leaveRequest.getStatus());
		}
	}

	private void notifyReviewOutcome(PolicyLeaveRequest leaveRequest, EmailBodyTemplates employeeTemplate,
			EmailBodyTemplates supervisorTemplate) {
		Employee employee = leaveRequest.getEmployee();
		Employee reviewer = leaveRequest.getReviewer();

		LeaveEmailDynamicFields employeeFields = leaveRequestEmailFields(leaveRequest);
		employeeFields.setEmployeeOrManagerName(fullName(employee));
		if (reviewer != null) {
			employeeFields.setManagerName(fullName(reviewer));
		}
		emailService.sendEmail(employeeTemplate, employeeFields, employee.getUser().getEmail());
		notificationService.createNotification(employee, leaveRequest.getId().toString(),
				NotificationType.LEAVE_REQUEST, employeeTemplate, employeeFields, NotificationCategory.LEAVE);

		List<EmployeeManager> otherSupervisors = employeeManagerDao.findByEmployee(employee)
			.stream()
			.filter(employeeManager -> reviewer == null
					|| !employeeManager.getManager().getEmployeeId().equals(reviewer.getEmployeeId()))
			.toList();

		notifySupervisors(otherSupervisors, leaveRequest, () -> {
			LeaveEmailDynamicFields supervisorFields = leaveRequestEmailFields(leaveRequest);
			supervisorFields.setEmployeeName(fullName(employee));
			if (reviewer != null) {
				supervisorFields.setManagerName(fullName(reviewer));
			}
			return supervisorFields;
		}, supervisorTemplate);
	}

	private void notifyCancelledLeaveRequest(PolicyLeaveRequest leaveRequest) {
		boolean isSingleDay = leaveRequest.getStartDate().equals(leaveRequest.getEndDate());
		Employee employee = leaveRequest.getEmployee();

		LeaveEmailDynamicFields employeeFields = leaveRequestEmailFields(leaveRequest);
		employeeFields.setEmployeeOrManagerName(fullName(employee));
		EmailBodyTemplates employeeTemplate = isSingleDay
				? EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_CANCEL_SINGLE_DAY_LEAVE
				: EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_CANCEL_MULTIPLE_DAY_LEAVE;

		emailService.sendEmail(employeeTemplate, employeeFields, employee.getUser().getEmail());
		notificationService.createNotification(employee, leaveRequest.getId().toString(),
				NotificationType.LEAVE_REQUEST, employeeTemplate, employeeFields, NotificationCategory.LEAVE);

		EmailBodyTemplates supervisorTemplate = isSingleDay
				? EmailBodyTemplates.LEAVE_MODULE_MANAGER_CANCEL_SINGLE_DAY_LEAVE
				: EmailBodyTemplates.LEAVE_MODULE_MANAGER_CANCEL_MULTIPLE_DAY_LEAVE;

		notifySupervisors(employeeManagerDao.findByEmployee(employee), leaveRequest, () -> {
			LeaveEmailDynamicFields supervisorFields = leaveRequestEmailFields(leaveRequest);
			supervisorFields.setEmployeeName(fullName(employee));
			supervisorFields.setEmployeesName(fullName(employee));
			return supervisorFields;
		}, supervisorTemplate);
	}

	private void notifySupervisors(List<EmployeeManager> supervisors, PolicyLeaveRequest leaveRequest,
			Supplier<LeaveEmailDynamicFields> fieldsSupplier, EmailBodyTemplates template) {
		notifySupervisors(supervisors, leaveRequest, fieldsSupplier, template, NotificationType.LEAVE_REQUEST);
	}

	private void notifySupervisors(List<EmployeeManager> supervisors, PolicyLeaveRequest leaveRequest,
			Supplier<LeaveEmailDynamicFields> fieldsSupplier, EmailBodyTemplates template,
			NotificationType notificationType) {
		PeopleUtil.filterManagersByLeaveRoles(supervisors).forEach(employeeManager -> {
			Employee supervisor = employeeManager.getManager();
			LeaveEmailDynamicFields dynamicFields = fieldsSupplier.get();
			dynamicFields.setEmployeeOrManagerName(fullName(supervisor));
			emailService.sendEmail(template, dynamicFields, supervisor.getUser().getEmail());
			notificationService.createNotification(supervisor, leaveRequest.getId().toString(), notificationType,
					template, dynamicFields, NotificationCategory.LEAVE);
		});
	}

	private void notifyNudgedLeaveRequest(PolicyLeaveRequest leaveRequest) {
		Employee employee = leaveRequest.getEmployee();
		EmailBodyTemplates template = leaveRequest.getStartDate().equals(leaveRequest.getEndDate())
				? EmailBodyTemplates.LEAVE_MODULE_MANAGER_NUDGE_SINGLE_DAY_LEAVE
				: EmailBodyTemplates.LEAVE_MODULE_MANAGER_NUDGE_MULTI_DAY_LEAVE;

		notifySupervisors(employeeManagerDao.findByEmployee(employee), leaveRequest, () -> {
			LeaveEmailDynamicFields dynamicFields = leaveRequestEmailFields(leaveRequest);
			dynamicFields.setEmployeeName(fullName(employee));
			dynamicFields.setEmployeesName(fullName(employee));
			return dynamicFields;
		}, template, NotificationType.LEAVE_REQUEST_NUDGE);
	}

	private LeaveEmailDynamicFields leaveRequestEmailFields(PolicyLeaveRequest leaveRequest) {
		LeaveEmailDynamicFields dynamicFields = new LeaveEmailDynamicFields();
		dynamicFields.setLeaveDuration(String.valueOf(leaveRequest.getLeaveState()));
		dynamicFields.setLeaveType(leaveRequest.getPolicy().getLeaveType().getName());
		dynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		dynamicFields.setLeaveEndDate(leaveRequest.getEndDate().toString());
		dynamicFields.setComment(leaveRequest.getReviewerComment());
		return dynamicFields;
	}

	private String fullName(Employee employee) {
		return employee.getFirstName() + " " + employee.getLastName();
	}

	private List<Holiday> getHolidaysForEmployee(Employee employee) {
		if (employee != null && employee.getWorkLocation() != null
				&& employee.getWorkLocation().getWorkLocationId() != null) {
			return holidayDao.findAllActiveHolidaysByWorkLocationId(employee.getWorkLocation().getWorkLocationId());
		}
		return holidayDao.findAllByIsActiveTrueAndWorkLocationsIsEmpty();
	}

	private int resolveYear(Integer year) {
		return year == null ? DateTimeUtils.getCurrentUtcDate().getYear() : year;
	}

	private boolean isHalfDay(LeaveState leaveState) {
		return leaveState == LeaveState.HALFDAY_MORNING || leaveState == LeaveState.HALFDAY_EVENING;
	}

}
