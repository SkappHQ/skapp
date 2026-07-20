package com.skapp.community.leaveplanner.service.impl;

import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.constant.LeaveMessageConstant;
import com.skapp.community.leaveplanner.mapper.LeaveMapper;
import com.skapp.community.leaveplanner.model.LeavePolicy;
import com.skapp.community.leaveplanner.model.PolicyLeaveType;
import com.skapp.community.leaveplanner.payload.request.LeavePolicyAccrualDetailDto;
import com.skapp.community.leaveplanner.payload.request.LeavePolicyFilterDto;
import com.skapp.community.leaveplanner.payload.request.LeavePolicyRequestDto;
import com.skapp.community.leaveplanner.payload.request.LeavePolicyUpdateRequestDto;
import com.skapp.community.leaveplanner.payload.response.LeavePolicyResponseDto;
import com.skapp.community.leaveplanner.payload.response.PolicyLeaveTypeResponseDto;
import com.skapp.community.leaveplanner.repository.LeavePolicyDao;
import com.skapp.community.leaveplanner.repository.PolicyLeaveTypeDao;
import com.skapp.community.leaveplanner.service.LeavePolicyService;
import com.skapp.community.leaveplanner.type.AccrualTiming;
import com.skapp.community.leaveplanner.type.FirstAccrualType;
import com.skapp.community.leaveplanner.type.LeavePolicyStatus;
import com.skapp.community.leaveplanner.type.PolicyType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class LeavePolicyServiceImpl implements LeavePolicyService {

	private static final int MAX_NAME_LENGTH = 100;

	private static final int MAX_PAGE_SIZE = 100;

	private static final float MIN_DAYS = 0.5F;

	private static final float MAX_DAYS = 365F;

	private static final Pattern HTML_TAG_PATTERN = Pattern.compile("<[^>]*>");

	private static final Pattern CARRYOVER_DATE_PATTERN = Pattern.compile("^(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$");

	private static final String DEFAULT_CARRYOVER_DATE = "01-01";

	private final LeavePolicyDao leavePolicyDao;

	private final PolicyLeaveTypeDao policyLeaveTypeDao;

	private final LeaveMapper leaveMapper;

	@Override
	@Transactional
	public ResponseEntityDto addLeavePolicy(LeavePolicyRequestDto leavePolicyRequestDto) {
		log.info("addLeavePolicy: execution started");

		validateRequiredFields(leavePolicyRequestDto);

		String sanitizedName = validateAndSanitizeName(leavePolicyRequestDto.getName());
		leavePolicyRequestDto.setName(sanitizedName);

		PolicyLeaveType leaveType = policyLeaveTypeDao
			.findByTypeIdAndIsActive(leavePolicyRequestDto.getLeaveTypeId(), true)
			.orElseThrow(
					() -> new EntityNotFoundException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_TYPE_NOT_FOUND));

		if (leavePolicyDao.existsByNameIgnoreCaseAndLeaveType_TypeId(sanitizedName, leaveType.getTypeId())) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_ALREADY_EXISTS);
		}

		validateEntitlementSetup(leavePolicyRequestDto);

		LeavePolicy leavePolicy = buildLeavePolicy(leavePolicyRequestDto, leaveType);
		leavePolicy = leavePolicyDao.save(leavePolicy);

		log.info("addLeavePolicy: policy created successfully policyId: {} policyType: {}", leavePolicy.getPolicyId(),
				leavePolicy.getPolicyType());

		return new ResponseEntityDto(false, leaveMapper.leavePolicyToLeavePolicyResponseDto(leavePolicy));
	}

	@Override
	@Transactional
	public ResponseEntityDto updateLeavePolicy(Long policyId, LeavePolicyUpdateRequestDto leavePolicyUpdateRequestDto) {
		log.info("updateLeavePolicy: execution started policyId: {}", policyId);

		LeavePolicy leavePolicy = getLeavePolicyById(policyId);

		String sanitizedName = validateAndSanitizeName(leavePolicyUpdateRequestDto.getName());

		if (leavePolicyDao.existsByNameIgnoreCaseAndLeaveType_TypeIdAndPolicyIdNot(sanitizedName,
				leavePolicy.getLeaveType().getTypeId(), policyId)) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_ALREADY_EXISTS);
		}

		leavePolicy.setName(sanitizedName);
		leavePolicy = leavePolicyDao.save(leavePolicy);

		log.info("updateLeavePolicy: policy updated successfully policyId: {}", leavePolicy.getPolicyId());

		return new ResponseEntityDto(false, leaveMapper.leavePolicyToLeavePolicyResponseDto(leavePolicy));
	}

	@Override
	@Transactional
	public ResponseEntityDto deactivateLeavePolicy(Long policyId) {
		log.info("deactivateLeavePolicy: execution started policyId: {}", policyId);

		LeavePolicy leavePolicy = getLeavePolicyById(policyId);

		leavePolicy.setStatus(LeavePolicyStatus.INACTIVE);
		leavePolicy = leavePolicyDao.save(leavePolicy);

		log.info("deactivateLeavePolicy: policy deactivated successfully policyId: {}", leavePolicy.getPolicyId());

		return new ResponseEntityDto(false, leaveMapper.leavePolicyToLeavePolicyResponseDto(leavePolicy));
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getPolicyLeaveTypes() {
		log.info("getPolicyLeaveTypes: execution started");

		List<PolicyLeaveTypeResponseDto> leaveTypes = leaveMapper
			.policyLeaveTypeListToPolicyLeaveTypeResponseDtoList(policyLeaveTypeDao.findAllByIsActive(true));

		return new ResponseEntityDto(false, leaveTypes);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getAllLeavePolicies(LeavePolicyFilterDto leavePolicyFilterDto) {
		log.info("getAllLeavePolicies: execution started");

		validatePagination(leavePolicyFilterDto);

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

	private LeavePolicy getLeavePolicyById(Long policyId) {
		return leavePolicyDao.findById(policyId)
			.orElseThrow(() -> new EntityNotFoundException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_NOT_FOUND));
	}

	private String sanitizeName(String name) {
		if (name == null) {
			return null;
		}
		return HTML_TAG_PATTERN.matcher(name).replaceAll("").trim();
	}

	private void validatePagination(LeavePolicyFilterDto filterDto) {
		if (filterDto.getPage() < 0) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_PAGE_INVALID);
		}
		if (filterDto.getSize() < 1 || filterDto.getSize() > MAX_PAGE_SIZE) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_PAGE_SIZE_INVALID);
		}
	}

	private void validateRequiredFields(LeavePolicyRequestDto dto) {
		if (dto.getLeaveTypeId() == null) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_LEAVE_TYPE_REQUIRED);
		}
		if (dto.getPolicyType() == null) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_POLICY_TYPE_REQUIRED);
		}
	}

	private String validateAndSanitizeName(String name) {
		String sanitizedName = sanitizeName(name);
		if (sanitizedName == null || sanitizedName.isBlank()) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_NAME_REQUIRED);
		}
		if (sanitizedName.length() > MAX_NAME_LENGTH) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_NAME_MAX_LENGTH_EXCEEDED);
		}
		return sanitizedName;
	}

	private void validateEntitlementSetup(LeavePolicyRequestDto dto) {
		if (dto.getPolicyType() == PolicyType.FLEXIBLE) {
			validateFlexibleSetup(dto);
		}
		else {
			validateAccrualSetup(dto.getAccrual());
		}
	}

	private void validateFlexibleSetup(LeavePolicyRequestDto dto) {
		if (dto.getAccrual() != null) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_ACCRUAL_CONFIG_NOT_ALLOWED);
		}
	}

	private void validateAccrualSetup(LeavePolicyAccrualDetailDto accrual) {
		if (accrual == null) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_ACCRUAL_CONFIG_REQUIRED);
		}
		if (accrual.getAccrualDays() == null || accrual.getAccrualDays() < MIN_DAYS
				|| accrual.getAccrualDays() > MAX_DAYS) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_ACCRUAL_DAYS_INVALID);
		}
		if (accrual.getFrequency() == null) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_ACCRUAL_FREQUENCY_REQUIRED);
		}
		if (accrual.getWaitingPeriodDays() != null && accrual.getWaitingPeriodDays() < 1) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_WAITING_PERIOD_INVALID);
		}
		if (accrual.getAccrualCapDays() != null && accrual.getAccrualCapDays() < 1) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_ACCRUAL_CAP_INVALID);
		}
		if (Boolean.TRUE.equals(accrual.getIsCarryoverEnabled())) {
			validateCarryoverSetup(accrual);
		}
	}

	private void validateCarryoverSetup(LeavePolicyAccrualDetailDto accrual) {
		if (accrual.getCarryoverDate() == null || accrual.getCarryoverDate().isBlank()) {
			accrual.setCarryoverDate(DEFAULT_CARRYOVER_DATE);
		}
		else if (!CARRYOVER_DATE_PATTERN.matcher(accrual.getCarryoverDate()).matches()) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_CARRYOVER_DATE_INVALID);
		}
		if (accrual.getMaxCarryoverDays() != null
				&& (accrual.getMaxCarryoverDays() < MIN_DAYS || accrual.getMaxCarryoverDays() > MAX_DAYS)) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_MAX_CARRYOVER_DAYS_INVALID);
		}
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
