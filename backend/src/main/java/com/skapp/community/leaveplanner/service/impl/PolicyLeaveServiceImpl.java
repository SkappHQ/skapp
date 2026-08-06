package com.skapp.community.leaveplanner.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.OrganizationService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.common.util.transformer.PageTransformer;
import com.skapp.community.leaveplanner.constant.LeaveMessageConstant;
import com.skapp.community.leaveplanner.constant.LeaveModuleConstant;
import com.skapp.community.leaveplanner.constant.PolicyLeaveConstant;
import com.skapp.community.leaveplanner.mapper.LeaveMapper;
import com.skapp.community.leaveplanner.model.EmployeeLeavePolicy;
import com.skapp.community.leaveplanner.model.LeavePolicy;
import com.skapp.community.leaveplanner.model.PolicyLeaveRequest;
import com.skapp.community.leaveplanner.model.PolicyLeaveRequestAttachment;
import com.skapp.community.leaveplanner.model.PolicyLeaveType;
import com.skapp.community.leaveplanner.payload.PolicyBalanceSnapshot;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveAttachmentDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveAvailabilityRequestDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveRequestDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveRequestFilterDto;
import com.skapp.community.leaveplanner.payload.response.EmployeePolicyBalanceResponseDto;
import com.skapp.community.leaveplanner.payload.response.PolicyLeaveAvailabilityResponseDto;
import com.skapp.community.leaveplanner.payload.response.PolicyLeaveRequestResponseDto;
import com.skapp.community.leaveplanner.repository.EmployeeLeavePolicyDao;
import com.skapp.community.leaveplanner.repository.PolicyLeaveRequestDao;
import com.skapp.community.leaveplanner.service.LeaveEmailService;
import com.skapp.community.leaveplanner.service.LeaveNotificationService;
import com.skapp.community.leaveplanner.service.LeavePolicyService;
import com.skapp.community.leaveplanner.service.PolicyLeaveBalanceCalculator;
import com.skapp.community.leaveplanner.service.PolicyLeaveService;
import com.skapp.community.leaveplanner.type.EmployeeLeavePolicyStatus;
import com.skapp.community.leaveplanner.type.LeaveDuration;
import com.skapp.community.leaveplanner.type.LeavePolicyStatus;
import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import com.skapp.community.leaveplanner.type.LeaveState;
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

import java.time.LocalDate;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.function.Predicate;

/**
 * Leave apply flow for organizations running on leave policies.
 *
 * <p>
 * This deliberately duplicates rather than reuses {@code LeaveServiceImpl}: the legacy
 * flow is scoped by leave type and settles against persisted leave_entitlement rows,
 * whereas this flow is scoped by an individual policy and derives its balance from the
 * policy's accrual configuration at read time. The two must be able to evolve
 * independently, so nothing in the legacy path is touched.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PolicyLeaveServiceImpl implements PolicyLeaveService {

	private static final Comparator<EmployeePolicyBalanceResponseDto> BY_POLICY_NAME = Comparator
		.comparing(EmployeePolicyBalanceResponseDto::getPolicyName, String.CASE_INSENSITIVE_ORDER);

	private final UserService userService;

	private final PeopleService peopleService;

	private final OrganizationService organizationService;

	private final LeavePolicyService leavePolicyService;

	private final PolicyLeaveBalanceCalculator policyLeaveBalanceCalculator;

	private final PolicyLeaveRequestDao policyLeaveRequestDao;

	private final EmployeeLeavePolicyDao employeeLeavePolicyDao;

	private final EmployeeManagerDao employeeManagerDao;

	private final HolidayDao holidayDao;

	private final TimeConfigDao timeConfigDao;

	private final LeaveMapper leaveMapper;

	private final PageTransformer pageTransformer;

	private final LeaveEmailService leaveEmailService;

	private final LeaveNotificationService leaveNotificationService;

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
			.findByEmployee_EmployeeIdAndStatusOrderByEffectiveFromDesc(currentUser.getEmployee().getEmployeeId(),
					EmployeeLeavePolicyStatus.ACTIVE);

		List<EmployeePolicyBalanceResponseDto> balances = assignments.stream()
			.map(assignment -> toBalanceCard(assignment, resolvedYear, hasSupervisor, today))
			.sorted(BY_POLICY_NAME)
			.toList();

		log.info("getCurrentUserPolicyBalances: execution ended with {} policy balances", balances.size());
		return new ResponseEntityDto(false, balances);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto checkPolicyLeaveAvailability(@NonNull PolicyLeaveAvailabilityRequestDto requestDto) {
		log.info("checkPolicyLeaveAvailability: execution started for policy: {}", requestDto.getPolicyId());
		requireLeavePoliciesEnabled();

		User currentUser = userService.getCurrentUser();
		EmployeeLeavePolicy assignment = resolveActiveAssignment(currentUser.getEmployee(), requestDto.getPolicyId());
		PolicyBalanceSnapshot snapshot = policyLeaveBalanceCalculator.calculateForDate(assignment,
				requestDto.getStartDate());

		PolicyLeaveAvailabilityResponseDto responseDto = new PolicyLeaveAvailabilityResponseDto();
		responseDto.setPolicyId(assignment.getPolicy().getId());
		responseDto.setPolicyName(assignment.getPolicy().getName());
		responseDto.setRemainingBalance(snapshot.balanceInDays());
		responseDto.setValidFrom(snapshot.usableFrom());
		responseDto.setValidTo(snapshot.cycleEnd());

		PolicyLeaveValidationFailure failure = firstFailure(currentUser.getEmployee(), snapshot,
				requestDto.getStartDate(), requestDto.getEndDate(), requestDto.getLeaveState(), responseDto);

		responseDto.setIsValid(failure == null);
		responseDto.setFailureReason(failure);
		if (responseDto.getRequestedDays() != null) {
			responseDto.setBalanceAfterRequest(snapshot.balanceInDays() - responseDto.getRequestedDays());
		}

		log.info("checkPolicyLeaveAvailability: execution ended, valid: {}", responseDto.getIsValid());
		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	@Transactional
	public ResponseEntityDto applyPolicyLeaveRequest(@NonNull PolicyLeaveRequestDto policyLeaveRequestDto) {
		log.info("applyPolicyLeaveRequest: execution started for policy: {}", policyLeaveRequestDto.getPolicyId());
		requireLeavePoliciesEnabled();

		User currentUser = userService.getCurrentUser();
		Employee employee = currentUser.getEmployee();

		List<EmployeeManagerResponseDto> managers = peopleService.getCurrentEmployeeManagers();
		if (managers.isEmpty()) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_NO_MANAGER_FOUND);
		}

		EmployeeLeavePolicy assignment = lockActiveAssignment(employee, policyLeaveRequestDto.getPolicyId());
		LeavePolicy policy = assignment.getPolicy();
		validatePolicyIsUsable(policy);
		validateAgainstLeaveType(policy.getLeaveType(), policyLeaveRequestDto);

		PolicyBalanceSnapshot snapshot = policyLeaveBalanceCalculator.calculateForDate(assignment,
				policyLeaveRequestDto.getStartDate());

		float durationDays = validateAndCalculateDuration(employee, snapshot, policyLeaveRequestDto.getStartDate(),
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
		leaveRequest.setIsViewed(false);
		leaveRequest.setIsAutoApproved(false);
		attachSupportingDocuments(leaveRequest, policy.getLeaveType(), policyLeaveRequestDto.getAttachments());

		List<EmployeeManager> employeeManagers = employeeManagerDao.findByEmployee(employee);
		if (Boolean.TRUE.equals(policy.getLeaveType().getIsAutoApproval())) {
			autoApprove(leaveRequest, employeeManagers);
		}

		PolicyLeaveRequest savedLeaveRequest = policyLeaveRequestDao.save(leaveRequest);
		log.info("applyPolicyLeaveRequest: {} day(s) committed against policy {} for leave request {}", durationDays,
				policy.getId(), savedLeaveRequest.getId());

		notifyParticipants(currentUser, savedLeaveRequest, employeeManagers);

		PolicyLeaveRequestResponseDto responseDto = leaveMapper
			.policyLeaveRequestToPolicyLeaveRequestResponseDto(savedLeaveRequest);
		responseDto.setRemainingBalance(snapshot.balanceInDays() - durationDays);

		log.info("applyPolicyLeaveRequest: execution ended. Leave Request ID: {}", savedLeaveRequest.getId());
		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getCurrentUserPolicyLeaveRequests(Integer year) {
		log.info("getCurrentUserPolicyLeaveRequests: execution started");
		requireLeavePoliciesEnabled();

		User currentUser = userService.getCurrentUser();
		int resolvedYear = resolveYear(year);

		List<PolicyLeaveRequest> leaveRequests = policyLeaveRequestDao
			.findByEmployee_EmployeeIdAndStartDateBetweenOrderByStartDateDesc(currentUser.getEmployee().getEmployeeId(),
					LocalDate.of(resolvedYear, 1, 1), LocalDate.of(resolvedYear, 12, 31));

		log.info("getCurrentUserPolicyLeaveRequests: execution ended with {} requests", leaveRequests.size());
		return new ResponseEntityDto(false,
				leaveMapper.policyLeaveRequestListToPolicyLeaveRequestResponseDtoList(leaveRequests));
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto searchCurrentUserPolicyLeaveRequests(@NonNull PolicyLeaveRequestFilterDto filterDto) {
		log.info("searchCurrentUserPolicyLeaveRequests: execution started");
		requireLeavePoliciesEnabled();

		User currentUser = userService.getCurrentUser();
		int resolvedYear = resolveYear(filterDto.getYear());

		Sort sort = Sort.by(filterDto.getSortOrder(), filterDto.getSortKey().toString());
		Pageable pageable = PageRequest.of(filterDto.getPage(), filterDto.getSize(), sort);

		Page<PolicyLeaveRequest> leaveRequests = policyLeaveRequestDao.findMyRequests(
				currentUser.getEmployee().getEmployeeId(), LocalDate.of(resolvedYear, 1, 1),
				LocalDate.of(resolvedYear, 12, 31), filterDto, pageable);

		PageDto pageDto = pageTransformer.transform(leaveRequests);
		// PageTransformer skips the metadata entirely when the current page has no rows,
		// which would report totalPages 0 to a client sitting on a now-out-of-range page
		// after a filter change. Restate it here rather than change shared behaviour.
		pageDto.setCurrentPage(leaveRequests.getNumber());
		pageDto.setTotalPages(leaveRequests.getTotalPages());
		pageDto.setTotalItems(leaveRequests.getTotalElements());
		pageDto.setItems(leaveMapper
			.policyLeaveRequestListToPolicyLeaveRequestResponseDtoList(leaveRequests.getContent()));

		log.info("searchCurrentUserPolicyLeaveRequests: execution ended with {} of {} requests",
				leaveRequests.getNumberOfElements(), leaveRequests.getTotalElements());
		return new ResponseEntityDto(false, pageDto);
	}

	// ---------------------------------------------------------------------
	// Balance cards
	// ---------------------------------------------------------------------

	private EmployeePolicyBalanceResponseDto toBalanceCard(EmployeeLeavePolicy assignment, int year,
			boolean hasSupervisor, LocalDate today) {
		LeavePolicy policy = assignment.getPolicy();
		PolicyBalanceSnapshot snapshot = policyLeaveBalanceCalculator.calculateForYear(assignment, year);

		EmployeePolicyBalanceResponseDto card = new EmployeePolicyBalanceResponseDto();
		card.setAssignmentId(assignment.getId());
		card.setPolicyId(policy.getId());
		card.setPolicyName(policy.getName());
		card.setPolicyType(policy.getPolicyType());
		card.setLeaveType(leaveMapper.policyLeaveTypeToPolicyLeaveTypeDetailResponseDto(policy.getLeaveType()));
		card.setYear(year);
		card.setEffectiveFrom(snapshot.effectiveFrom());
		card.setValidFrom(snapshot.usableFrom());
		card.setValidTo(snapshot.cycleEnd());
		card.setCarriedForwardDays(snapshot.carriedForwardDays());
		card.setAccruedDays(snapshot.accruedDays());
		card.setTotalDaysAllocated(snapshot.totalDaysAllocated());
		card.setTotalDaysUsed(snapshot.totalDaysUsed());
		card.setBalanceInDays(snapshot.balanceInDays());
		card.setIsUnlimited(snapshot.isUnlimited());
		card.setIsBalanceAvailable(snapshot.isDerived());

		PolicyBalanceDisabledReason disabledReason = resolveDisabledReason(snapshot, hasSupervisor, today);
		card.setDisabledReason(disabledReason);
		card.setIsDisabled(disabledReason != null);
		return card;
	}

	/**
	 * Mirrors the three reasons an entitlement card is disabled today. Expiry is checked
	 * before utilization so an expired-and-empty policy reports the more specific reason.
	 */
	private PolicyBalanceDisabledReason resolveDisabledReason(PolicyBalanceSnapshot snapshot, boolean hasSupervisor,
			LocalDate today) {
		// A deactivated policy is no longer available to apply against, so surface that
		// on the card rather than letting the user reach the modal and fail at submit.
		if (snapshot.policy().getStatus() != LeavePolicyStatus.ACTIVE) {
			return PolicyBalanceDisabledReason.POLICY_INACTIVE;
		}
		if (snapshot.cycleEnd().isBefore(today)) {
			return PolicyBalanceDisabledReason.ALLOCATION_PERIOD_EXPIRED;
		}
		if (!snapshot.hasBalance()) {
			return PolicyBalanceDisabledReason.FULLY_UTILIZED;
		}
		if (!hasSupervisor) {
			return PolicyBalanceDisabledReason.NO_SUPERVISOR_ASSIGNED;
		}
		return null;
	}

	// ---------------------------------------------------------------------
	// Validation
	// ---------------------------------------------------------------------

	/**
	 * Runs the same checks as {@link #validateAndCalculateDuration} but reports the first
	 * failure instead of throwing, and records the computed duration on the response.
	 */
	private PolicyLeaveValidationFailure firstFailure(Employee employee, PolicyBalanceSnapshot snapshot,
			LocalDate startDate, LocalDate endDate, LeaveState leaveState,
			PolicyLeaveAvailabilityResponseDto responseDto) {
		if (endDate.isBefore(startDate)) {
			return PolicyLeaveValidationFailure.INVALID_DATE_RANGE;
		}
		if (startDate.isBefore(snapshot.usableFrom()) || endDate.isAfter(snapshot.cycleEnd())) {
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
		if (!snapshot.canAccommodate(requestedDays)) {
			return PolicyLeaveValidationFailure.INSUFFICIENT_BALANCE;
		}
		return null;
	}

	/**
	 * Authoritative server-side validation for submission. Two tabs racing against the
	 * same policy both pass their client-side checks; whichever commits second is rejected
	 * here, because the caller holds a write lock on the assignment and so recomputes its
	 * balance against the first request's committed days.
	 */
	private float validateAndCalculateDuration(Employee employee, PolicyBalanceSnapshot snapshot, LocalDate startDate,
			LocalDate endDate, LeaveState leaveState) {
		if (endDate.isBefore(startDate)) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_INVALID_DATE_RANGE);
		}
		if (startDate.isBefore(snapshot.usableFrom()) || endDate.isAfter(snapshot.cycleEnd())) {
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
		if (!snapshot.canAccommodate(requestedDays)) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_INSUFFICIENT_BALANCE,
					new Object[] { snapshot.balanceInDays(), snapshot.policy().getName() });
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
		if (requestDto.getAttachments() != null
				&& requestDto.getAttachments().size() > PolicyLeaveConstant.MAX_ATTACHMENTS) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_TOO_MANY_ATTACHMENTS);
		}
		if (leaveType.getMinDuration() == LeaveDuration.FULL_DAY && isHalfDay(requestDto.getLeaveState())) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_CANNOT_APPLY_HALFDAY);
		}
		if (leaveType.getMinDuration() == LeaveDuration.HALF_DAY && requestDto.getLeaveState() == LeaveState.FULLDAY) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_CANNOT_APPLY_FULLDAY);
		}
		// A half-day only ever means half of one day; without this a multi-day half-day
		// range would be charged as full days while still passing the overlap check.
		if (isHalfDay(requestDto.getLeaveState()) && !requestDto.getStartDate().equals(requestDto.getEndDate())) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_HALFDAY_SINGLE_DATE_ONLY);
		}
		if (requestDto.getRequestDesc() != null
				&& requestDto.getRequestDesc().length() > PolicyLeaveConstant.MAX_REQUEST_DESCRIPTION_LENGTH) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_DESCRIPTION_MAX_LENGTH);
		}
	}

	/**
	 * An employee cannot hold two leaves on the same slot, regardless of which policy each
	 * was raised against. Two half-days on the same date are allowed only when they cover
	 * opposite halves.
	 */
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
		if (workingDays == 1 && isHalfDay(leaveState)) {
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

	// ---------------------------------------------------------------------
	// Helpers
	// ---------------------------------------------------------------------

	private void requireLeavePoliciesEnabled() {
		if (!leavePolicyService.isLeavePoliciesEnabled()) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_NOT_ENABLED);
		}
	}

	/**
	 * Resolves the policy the request is scoped to, and proves it is still assigned to the
	 * caller. This is what rejects a request whose policy was unassigned mid-session.
	 */
	private EmployeeLeavePolicy resolveActiveAssignment(Employee employee, Long policyId) {
		return employeeLeavePolicyDao
			.findByEmployee_EmployeeIdAndPolicy_IdAndStatus(employee.getEmployeeId(), policyId,
					EmployeeLeavePolicyStatus.ACTIVE)
			.orElseThrow(() -> new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_POLICY_NOT_ASSIGNED));
	}

	/**
	 * Same resolution, but holding a write lock on the assignment for the duration of the
	 * transaction. Two tabs submitting against the same policy at once therefore serialise,
	 * and the second one recomputes its balance against the first one's committed days.
	 */
	private EmployeeLeavePolicy lockActiveAssignment(Employee employee, Long policyId) {
		return employeeLeavePolicyDao
			.findActiveAssignmentForUpdate(employee.getEmployeeId(), policyId, EmployeeLeavePolicyStatus.ACTIVE)
			.orElseThrow(() -> new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_POLICY_NOT_ASSIGNED));
	}

	/**
	 * Child rows are built here rather than mapped, because each one needs a back
	 * reference to the request that owns it. Cascade + orphanRemoval on the association
	 * handles the persist.
	 */
	private void attachSupportingDocuments(PolicyLeaveRequest leaveRequest, PolicyLeaveType leaveType,
			List<PolicyLeaveAttachmentDto> attachmentDtos) {
		if (!Boolean.TRUE.equals(leaveType.getIsAttachment()) || attachmentDtos == null || attachmentDtos.isEmpty()) {
			return;
		}

		List<PolicyLeaveRequestAttachment> attachments = attachmentDtos.stream()
			.filter(dto -> dto != null && StringUtils.isNotBlank(dto.getFileUrl()))
			.filter(distinctByFileUrl())
			.map(dto -> new PolicyLeaveRequestAttachment(leaveRequest, dto.getFileUrl(), dto.getOriginalFileName()))
			.toList();

		leaveRequest.getAttachments().addAll(attachments);
	}

	/**
	 * The same file uploaded twice produces the same handle; keep the first occurrence so
	 * a double-click on Upload cannot create duplicate rows.
	 */
	private Predicate<PolicyLeaveAttachmentDto> distinctByFileUrl() {
		Set<String> seen = new HashSet<>();
		return dto -> seen.add(dto.getFileUrl());
	}

	/**
	 * Auto-approval attributes the review to the employee's first manager, matching how
	 * the legacy flow records an auto-approved request.
	 */
	private void autoApprove(PolicyLeaveRequest leaveRequest, List<EmployeeManager> employeeManagers) {
		leaveRequest.setStatus(LeaveRequestStatus.APPROVED);
		leaveRequest.setIsAutoApproved(true);
		leaveRequest.setReviewedDate(DateTimeUtils.getCurrentUtcDateTime());
		if (!employeeManagers.isEmpty()) {
			leaveRequest.setReviewer(employeeManagers.getFirst().getManager());
		}
		log.info("autoApprove: leave request against policy {} marked auto-approved before persist",
				leaveRequest.getPolicy().getId());
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

	private List<Holiday> getHolidaysForEmployee(Employee employee) {
		if (employee != null && employee.getWorkLocation() != null
				&& employee.getWorkLocation().getWorkLocationId() != null) {
			return holidayDao.findAllActiveHolidaysByWorkLocationId(employee.getWorkLocation().getWorkLocationId());
		}
		return holidayDao.findAllByIsActiveTrue();
	}

	/**
	 * Narrow window around the current year. The carryover walk costs one query per cycle,
	 * so an unbounded year would let a single request fan out into a hundred of them.
	 */
	private int resolveYear(Integer year) {
		int currentYear = DateTimeUtils.getCurrentUtcDate().getYear();
		if (year == null) {
			return currentYear;
		}
		if (year < currentYear - PolicyLeaveConstant.MAX_YEAR_OFFSET
				|| year > currentYear + PolicyLeaveConstant.MAX_YEAR_OFFSET) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_INVALID_YEAR);
		}
		return year;
	}

	private boolean isHalfDay(LeaveState leaveState) {
		return leaveState == LeaveState.HALFDAY_MORNING || leaveState == LeaveState.HALFDAY_EVENING;
	}

}
