package com.skapp.community.leaveplanner.service.impl;

import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.OrganizationConfig;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.repository.OrganizationConfigDao;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.OrganizationConfigType;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.leaveplanner.constant.LeaveMessageConstant;
import com.skapp.community.leaveplanner.constant.LeaveModuleConstant;
import com.skapp.community.leaveplanner.mapper.LeaveMapper;
import com.skapp.community.leaveplanner.model.LeaveEntitlement;
import com.skapp.community.leaveplanner.model.LeavePolicy;
import com.skapp.community.leaveplanner.model.LeaveRequest;
import com.skapp.community.leaveplanner.model.LeaveRequestEntitlement;
import com.skapp.community.leaveplanner.model.PolicyLeaveType;
import com.skapp.community.leaveplanner.payload.request.LeavePolicyAccrualDetailDto;
import com.skapp.community.leaveplanner.payload.request.LeavePolicyFilterDto;
import com.skapp.community.leaveplanner.payload.request.LeavePolicyRequestDto;
import com.skapp.community.leaveplanner.payload.request.LeavePolicyUpdateRequestDto;
import com.skapp.community.leaveplanner.payload.response.LeavePolicyConfigResponseDto;
import com.skapp.community.leaveplanner.payload.response.LeavePolicyResponseDto;
import com.skapp.community.leaveplanner.payload.response.LeavePolicyStatusResponseDto;
import com.skapp.community.leaveplanner.repository.LeaveEntitlementDao;
import com.skapp.community.leaveplanner.repository.LeavePolicyDao;
import com.skapp.community.leaveplanner.repository.LeaveRequestDao;
import com.skapp.community.leaveplanner.repository.LeaveRequestEntitlementDao;
import com.skapp.community.leaveplanner.repository.PolicyLeaveTypeDao;
import com.skapp.community.leaveplanner.service.LeavePolicyService;
import com.skapp.community.leaveplanner.type.AccrualTiming;
import com.skapp.community.leaveplanner.type.FirstAccrualType;
import com.skapp.community.leaveplanner.type.LeavePolicyStatus;
import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import com.skapp.community.leaveplanner.type.PolicyType;
import com.skapp.community.leaveplanner.util.LeavePolicyValidationUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.node.ObjectNode;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class LeavePolicyServiceImpl implements LeavePolicyService {

	private final LeavePolicyDao leavePolicyDao;

	private final PolicyLeaveTypeDao policyLeaveTypeDao;

	private final LeaveMapper leaveMapper;

	private final OrganizationConfigDao organizationConfigDao;

	private final LeaveEntitlementDao leaveEntitlementDao;

	private final LeaveRequestDao leaveRequestDao;

	private final LeaveRequestEntitlementDao leaveRequestEntitlementDao;

	private final UserService userService;

	private final JsonMapper jsonMapper;

	@Override
	@Transactional
	public ResponseEntityDto addLeavePolicy(LeavePolicyRequestDto leavePolicyRequestDto) {
		log.info("addLeavePolicy: execution started");

		LeavePolicyValidationUtil.validateRequiredFields(leavePolicyRequestDto);

		LeavePolicyValidationUtil.validateName(leavePolicyRequestDto.getName());

		PolicyLeaveType leaveType = policyLeaveTypeDao.findByIdAndIsActiveTrue(leavePolicyRequestDto.getLeaveTypeId())
			.orElseThrow(
					() -> new EntityNotFoundException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_TYPE_NOT_FOUND));

		if (leavePolicyDao.existsByNameIgnoreCaseAndLeaveType_Id(leavePolicyRequestDto.getName(), leaveType.getId())) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_ALREADY_EXISTS);
		}

		LeavePolicyValidationUtil.validateEntitlementSetup(leavePolicyRequestDto);

		LeavePolicy leavePolicy = buildLeavePolicy(leavePolicyRequestDto, leaveType);
		leavePolicy = leavePolicyDao.save(leavePolicy);

		log.info("addLeavePolicy: policy created successfully");

		return new ResponseEntityDto(false, leaveMapper.leavePolicyToLeavePolicyResponseDto(leavePolicy));
	}

	@Override
	@Transactional
	public ResponseEntityDto updateLeavePolicy(Long id, LeavePolicyUpdateRequestDto leavePolicyUpdateRequestDto) {
		log.info("updateLeavePolicy: execution started");

		LeavePolicy leavePolicy = getLeavePolicyById(id);

		LeavePolicyValidationUtil.validateName(leavePolicyUpdateRequestDto.getName());

		if (leavePolicyDao.existsByNameIgnoreCaseAndLeaveType_IdAndIdNot(leavePolicyUpdateRequestDto.getName(),
				leavePolicy.getLeaveType().getId(), id)) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_ALREADY_EXISTS);
		}

		leavePolicy.setName(leavePolicyUpdateRequestDto.getName());
		leavePolicy = leavePolicyDao.save(leavePolicy);

		log.info("updateLeavePolicy: policy updated successfully");

		return new ResponseEntityDto(false, leaveMapper.leavePolicyToLeavePolicyResponseDto(leavePolicy));
	}

	@Override
	@Transactional
	public ResponseEntityDto deactivateLeavePolicy(Long id) {
		log.info("deactivateLeavePolicy: execution started");

		LeavePolicy leavePolicy = getLeavePolicyById(id);

		leavePolicy.setStatus(LeavePolicyStatus.INACTIVE);
		leavePolicy = leavePolicyDao.save(leavePolicy);

		log.info("deactivateLeavePolicy: policy deactivated successfully");

		return new ResponseEntityDto(false,
				new LeavePolicyStatusResponseDto(leavePolicy.getId(), leavePolicy.getStatus()));
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getAllLeavePolicies(LeavePolicyFilterDto leavePolicyFilterDto) {
		log.info("getAllLeavePolicies: execution started");

		Pageable pageable = PageRequest.of(leavePolicyFilterDto.getPage(), leavePolicyFilterDto.getSize());
		Page<LeavePolicy> leavePolicyPage = leavePolicyDao.findLeavePolicies(leavePolicyFilterDto, pageable);

		List<LeavePolicyResponseDto> leavePolicyResponseDtos = leaveMapper
			.leavePolicyListToLeavePolicyResponseDtoList(leavePolicyPage.getContent());

		PageDto pageDto = new PageDto();
		pageDto.setItems(leavePolicyResponseDtos);
		pageDto.setCurrentPage(leavePolicyPage.getNumber());
		pageDto.setTotalItems(leavePolicyPage.getTotalElements());
		pageDto.setTotalPages(leavePolicyPage.getTotalPages());

		log.info("getAllLeavePolicies: execution ended");
		return new ResponseEntityDto(false, pageDto);
	}

	@Override
	@Transactional
	public ResponseEntityDto enableLeavePolicies() {
		log.info("enableLeavePolicies: execution started");

		User currentUser = userService.getCurrentUser();

		Optional<OrganizationConfig> existingConfig = organizationConfigDao
			.findOrganizationConfigByOrganizationConfigType(OrganizationConfigType.LEAVE_POLICY.name());

		if (existingConfig.isPresent() && isLeavePolicyEnabled(existingConfig.get())) {
			log.info("AUDIT action=ENABLE_LEAVE_POLICIES adminUserId={} outcome=REJECTED errorCode=ALREADY_ENABLED",
					currentUser.getUserId());
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_ALREADY_ENABLED);
		}

		int cancelledPendingRequests = cancelPendingLeaveRequests();
		int revokedApprovedRequests = revokeFutureApprovedLeaveRequests();
		int removedAllocations = removeExistingLeaveAllocations();

		ObjectNode configValue = jsonMapper.createObjectNode();
		configValue.put(LeaveModuleConstant.LEAVE_POLICY_IS_ENABLED, true);
		String jsonValue = jsonMapper.writeValueAsString(configValue);

		OrganizationConfig organizationConfig = existingConfig
			.orElseGet(() -> new OrganizationConfig(OrganizationConfigType.LEAVE_POLICY.name(), jsonValue));
		organizationConfig.setOrganizationConfigValue(jsonValue);
		organizationConfigDao.save(organizationConfig);

		log.info(
				"AUDIT action=ENABLE_LEAVE_POLICIES adminUserId={} outcome=SUCCESS removedAllocations={} "
						+ "cancelledPendingRequests={} revokedApprovedRequests={}",
				currentUser.getUserId(), removedAllocations, cancelledPendingRequests, revokedApprovedRequests);
		log.info("enableLeavePolicies: execution ended");

		return new ResponseEntityDto(false, new LeavePolicyConfigResponseDto(true));
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getLeavePolicyConfig() {
		log.info("getLeavePolicyConfig: execution started");

		Optional<OrganizationConfig> existingConfig = organizationConfigDao
			.findOrganizationConfigByOrganizationConfigType(OrganizationConfigType.LEAVE_POLICY.name());

		boolean enabled = existingConfig.isPresent() && isLeavePolicyEnabled(existingConfig.get());

		log.info("getLeavePolicyConfig: execution ended");
		return new ResponseEntityDto(false, new LeavePolicyConfigResponseDto(enabled));
	}

	private int removeExistingLeaveAllocations() {
		List<LeaveEntitlement> allocations = leaveEntitlementDao.findByIsActiveTrue();
		if (allocations.isEmpty()) {
			return 0;
		}

		allocations.forEach(allocation -> {
			allocation.setTotalDaysAllocated(0F);
			allocation.setActive(false);
		});
		leaveEntitlementDao.saveAll(allocations);

		return allocations.size();
	}

	private int cancelPendingLeaveRequests() {
		return voidLeaveRequests(leaveRequestDao.findByStatus(LeaveRequestStatus.PENDING),
				LeaveRequestStatus.CANCELLED);
	}

	private int revokeFutureApprovedLeaveRequests() {
		List<LeaveRequest> futureApprovedRequests = leaveRequestDao
			.findByStatusAndStartDateAfter(LeaveRequestStatus.APPROVED, DateTimeUtils.getCurrentUtcDate());

		return voidLeaveRequests(futureApprovedRequests, LeaveRequestStatus.REVOKED);
	}

	private int voidLeaveRequests(List<LeaveRequest> leaveRequests, LeaveRequestStatus status) {
		if (leaveRequests.isEmpty()) {
			return 0;
		}

		leaveRequests.forEach(leaveRequest -> {
			leaveRequest.setStatus(status);
			leaveRequest.setReviewedDate(DateTimeUtils.getCurrentUtcDateTime());
		});
		leaveRequestDao.saveAll(leaveRequests);

		releaseEntitlementUsage(leaveRequests);

		return leaveRequests.size();
	}

	private void releaseEntitlementUsage(List<LeaveRequest> leaveRequests) {
		List<LeaveRequestEntitlement> leaveRequestEntitlements = leaveRequestEntitlementDao
			.findAllByLeaveRequestIn(leaveRequests);
		if (leaveRequestEntitlements.isEmpty()) {
			return;
		}

		Map<Long, LeaveEntitlement> affectedEntitlements = new LinkedHashMap<>();
		leaveRequestEntitlements.forEach(leaveRequestEntitlement -> {
			LeaveEntitlement leaveEntitlement = leaveRequestEntitlement.getLeaveEntitlement();
			leaveEntitlement
				.setTotalDaysUsed(leaveEntitlement.getTotalDaysUsed() - leaveRequestEntitlement.getDaysUsed());
			affectedEntitlements.put(leaveEntitlement.getEntitlementId(), leaveEntitlement);
		});

		leaveEntitlementDao.saveAll(affectedEntitlements.values());
		leaveRequestEntitlementDao.deleteAllInBatch(leaveRequestEntitlements);
	}

	private boolean isLeavePolicyEnabled(OrganizationConfig organizationConfig) {
		JsonNode configNode = jsonMapper.readTree(organizationConfig.getOrganizationConfigValue());
		JsonNode enabledNode = configNode.get(LeaveModuleConstant.LEAVE_POLICY_IS_ENABLED);
		return enabledNode != null && enabledNode.asBoolean();
	}

	private LeavePolicy getLeavePolicyById(Long id) {
		return leavePolicyDao.findById(id)
			.orElseThrow(() -> new EntityNotFoundException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_NOT_FOUND));
	}

	private LeavePolicy buildLeavePolicy(LeavePolicyRequestDto dto, PolicyLeaveType leaveType) {
		LeavePolicy leavePolicy = new LeavePolicy();
		leavePolicy.setName(dto.getName());
		leavePolicy.setLeaveType(leaveType);
		leavePolicy.setPolicyType(dto.getPolicyType());
		leavePolicy.setStatus(LeavePolicyStatus.ACTIVE);

		if (dto.getPolicyType() == PolicyType.ACCRUAL) {
			applyAccrualDetail(leavePolicy, dto.getAccrual());
		}

		return leavePolicy;
	}

	private void applyAccrualDetail(LeavePolicy leavePolicy, LeavePolicyAccrualDetailDto accrualDto) {
		leavePolicy.setAccrualDays(accrualDto.getAccrualDays());
		leavePolicy.setFrequency(accrualDto.getFrequency());
		leavePolicy.setWaitingPeriodDays(accrualDto.getWaitingPeriodDays());
		leavePolicy.setAccrualCapDays(accrualDto.getAccrualCapDays());

		boolean carryoverEnabled = Boolean.TRUE.equals(accrualDto.getIsCarryoverEnabled());
		leavePolicy.setIsCarryoverEnabled(carryoverEnabled);
		leavePolicy.setCarryoverDate(carryoverEnabled ? accrualDto.getCarryoverDate() : null);
		leavePolicy.setMaxCarryoverDays(carryoverEnabled ? accrualDto.getMaxCarryoverDays() : null);

		leavePolicy.setFirstAccrual(
				accrualDto.getFirstAccrual() != null ? accrualDto.getFirstAccrual() : FirstAccrualType.PRORATED);
		leavePolicy.setAccrualTiming(
				accrualDto.getAccrualTiming() != null ? accrualDto.getAccrualTiming() : AccrualTiming.PERIOD_END);
	}

}
