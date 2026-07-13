package com.skapp.community.leaveplanner.service.impl;

import com.skapp.community.common.exception.ConflictException;
import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.constant.LeaveMessageConstant;
import com.skapp.community.leaveplanner.model.LeavePolicy;
import com.skapp.community.leaveplanner.model.PolicyLeaveType;
import com.skapp.community.leaveplanner.payload.request.LeavePolicyAccrualDetailDto;
import com.skapp.community.leaveplanner.payload.request.LeavePolicyRequestDto;
import com.skapp.community.leaveplanner.payload.response.LeavePolicyResponseDto;
import com.skapp.community.leaveplanner.payload.response.PolicyLeaveTypeResponseDto;
import com.skapp.community.leaveplanner.repository.LeavePolicyDao;
import com.skapp.community.leaveplanner.repository.PolicyLeaveTypeDao;
import com.skapp.community.leaveplanner.service.LeavePolicyService;
import com.skapp.community.leaveplanner.type.AccrualTiming;
import com.skapp.community.leaveplanner.type.PolicyType;
import com.skapp.community.leaveplanner.type.FirstAccrualType;
import com.skapp.community.leaveplanner.type.LeavePolicyStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class LeavePolicyServiceImpl implements LeavePolicyService {

	private static final float MIN_DAYS = 0.5F;

	private static final float MAX_DAYS = 365F;

	private static final Pattern HTML_TAG_PATTERN = Pattern.compile("<[^>]*>");

	private static final Pattern CARRYOVER_DATE_PATTERN = Pattern.compile("^(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$");

	private static final String DEFAULT_CARRYOVER_DATE = "01-01";

	private final LeavePolicyDao leavePolicyDao;

	private final PolicyLeaveTypeDao policyLeaveTypeDao;

	@Override
	@Transactional
	public ResponseEntityDto addLeavePolicy(LeavePolicyRequestDto leavePolicyRequestDto) {
		log.info("addLeavePolicy: execution started");

		String sanitizedName = sanitizeName(leavePolicyRequestDto.getName());
		leavePolicyRequestDto.setName(sanitizedName);

		PolicyLeaveType leaveType = policyLeaveTypeDao
			.findByTypeIdAndIsActive(leavePolicyRequestDto.getLeaveTypeId(), true)
			.orElseThrow(
					() -> new EntityNotFoundException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_TYPE_NOT_FOUND));

		if (leavePolicyDao.existsByNameIgnoreCaseAndLeaveType_TypeId(sanitizedName, leaveType.getTypeId())) {
			throw new ConflictException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_ALREADY_EXISTS);
		}

		validateEntitlementSetup(leavePolicyRequestDto);
		validateCarryForward(leavePolicyRequestDto);

		LeavePolicy leavePolicy = buildLeavePolicy(leavePolicyRequestDto, leaveType);
		leavePolicy = leavePolicyDao.save(leavePolicy);

		log.info("addLeavePolicy: policy created successfully policyId: {} policyType: {}",
				leavePolicy.getPolicyId(), leavePolicy.getPolicyType());

		return new ResponseEntityDto(false, toResponseDto(leavePolicy));
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getPolicyLeaveTypes() {
		List<PolicyLeaveTypeResponseDto> leaveTypes = policyLeaveTypeDao.findAllByIsActive(true)
			.stream()
			.map(this::toPolicyLeaveTypeResponseDto)
			.toList();

		return new ResponseEntityDto(false, leaveTypes);
	}

	private String sanitizeName(String name) {
		if (name == null) {
			return null;
		}
		return HTML_TAG_PATTERN.matcher(name).replaceAll("").trim();
	}

	private void validateEntitlementSetup(LeavePolicyRequestDto dto) {
		if (dto.getPolicyType() == PolicyType.FIXED) {
			validateFixedSetup(dto);
		}
		else {
			validateAccrualSetup(dto.getAccrual());
		}
	}

	private void validateFixedSetup(LeavePolicyRequestDto dto) {
		if (dto.getAccrual() != null) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_ACCRUAL_CONFIG_NOT_ALLOWED);
		}
		if (dto.getFixedDaysAllocated() == null || dto.getFixedDaysAllocated() < MIN_DAYS
				|| dto.getFixedDaysAllocated() > MAX_DAYS) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_FIXED_DAYS_INVALID);
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
		if (Boolean.TRUE.equals(accrual.getCarryoverEnabled())) {
			if (accrual.getCarryoverDate() == null || accrual.getCarryoverDate().isBlank()) {
				accrual.setCarryoverDate(DEFAULT_CARRYOVER_DATE);
			}
			else if (!CARRYOVER_DATE_PATTERN.matcher(accrual.getCarryoverDate()).matches()) {
				throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_CARRYOVER_DATE_INVALID);
			}
		}
	}

	private void validateCarryForward(LeavePolicyRequestDto dto) {
		if (!Boolean.TRUE.equals(dto.getCarryForwardEnabled())) {
			return;
		}
		if (dto.getMaxCarryForwardDays() == null || dto.getCarryForwardExpiryDate() == null) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_CARRY_FORWARD_DETAILS_REQUIRED);
		}
		if (dto.getMaxCarryForwardDays() < MIN_DAYS || dto.getMaxCarryForwardDays() > MAX_DAYS) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_CARRY_FORWARD_DAYS_INVALID);
		}
		if (!dto.getCarryForwardExpiryDate().isAfter(LocalDate.now())) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_CARRY_FORWARD_EXPIRY_INVALID);
		}
	}

	private LeavePolicy buildLeavePolicy(LeavePolicyRequestDto dto, PolicyLeaveType leaveType) {
		LeavePolicy leavePolicy = new LeavePolicy();
		leavePolicy.setName(dto.getName());
		leavePolicy.setLeaveType(leaveType);
		leavePolicy.setPolicyType(dto.getPolicyType());
		leavePolicy.setStatus(LeavePolicyStatus.ACTIVE);
		leavePolicy.setIsCarryForwardEnabled(Boolean.TRUE.equals(dto.getCarryForwardEnabled()));

		if (Boolean.TRUE.equals(dto.getCarryForwardEnabled())) {
			leavePolicy.setMaxCarryForwardDays(dto.getMaxCarryForwardDays());
			leavePolicy.setCarryForwardExpiryDate(dto.getCarryForwardExpiryDate());
		}

		if (dto.getPolicyType() == PolicyType.FIXED) {
			leavePolicy.setFixedDaysAllocated(dto.getFixedDaysAllocated());
		}
		else {
			applyAccrualDetail(leavePolicy, dto.getAccrual());
		}

		return leavePolicy;
	}

	private void applyAccrualDetail(LeavePolicy leavePolicy, LeavePolicyAccrualDetailDto accrualDto) {
		leavePolicy.setAccrualDays(accrualDto.getAccrualDays());
		leavePolicy.setFrequency(accrualDto.getFrequency());
		leavePolicy.setWaitingPeriodDays(accrualDto.getWaitingPeriodDays());
		leavePolicy.setAccrualCapDays(accrualDto.getAccrualCapDays());

		boolean carryoverEnabled = Boolean.TRUE.equals(accrualDto.getCarryoverEnabled());
		leavePolicy.setIsCarryoverEnabled(carryoverEnabled);
		leavePolicy.setCarryoverDate(carryoverEnabled ? accrualDto.getCarryoverDate() : null);
		leavePolicy.setIsResetNegativeOnCarryover(
				carryoverEnabled && Boolean.TRUE.equals(accrualDto.getResetNegativeOnCarryover()));

		leavePolicy.setFirstAccrual(
				accrualDto.getFirstAccrual() != null ? accrualDto.getFirstAccrual() : FirstAccrualType.PRORATED);
		leavePolicy.setAccrualTiming(
				accrualDto.getAccrualTiming() != null ? accrualDto.getAccrualTiming() : AccrualTiming.PERIOD_END);
	}

	private LeavePolicyResponseDto toResponseDto(LeavePolicy leavePolicy) {
		LeavePolicyResponseDto responseDto = new LeavePolicyResponseDto();
		responseDto.setPolicyId(leavePolicy.getPolicyId());
		responseDto.setName(leavePolicy.getName());
		responseDto.setLeaveTypeId(leavePolicy.getLeaveType().getTypeId());
		responseDto.setLeaveTypeName(leavePolicy.getLeaveType().getName());
		responseDto.setLeaveTypeEmoji(leavePolicy.getLeaveType().getEmojiCode());
		responseDto.setPolicyType(leavePolicy.getPolicyType());
		responseDto.setStatus(leavePolicy.getStatus());
		responseDto.setFixedDaysAllocated(leavePolicy.getFixedDaysAllocated());
		responseDto.setCarryForwardEnabled(leavePolicy.getIsCarryForwardEnabled());
		responseDto.setMaxCarryForwardDays(leavePolicy.getMaxCarryForwardDays());
		responseDto.setCarryForwardExpiryDate(leavePolicy.getCarryForwardExpiryDate());

		if (leavePolicy.getPolicyType() != PolicyType.FIXED) {
			responseDto.setAccrualDays(leavePolicy.getAccrualDays());
			responseDto.setFrequency(leavePolicy.getFrequency());
			responseDto.setWaitingPeriodDays(leavePolicy.getWaitingPeriodDays());
			responseDto.setAccrualCapDays(leavePolicy.getAccrualCapDays());
			responseDto.setCarryoverEnabled(leavePolicy.getIsCarryoverEnabled());
			responseDto.setCarryoverDate(leavePolicy.getCarryoverDate());
			responseDto.setResetNegativeOnCarryover(leavePolicy.getIsResetNegativeOnCarryover());
			responseDto.setFirstAccrual(leavePolicy.getFirstAccrual());
			responseDto.setAccrualTiming(leavePolicy.getAccrualTiming());
		}

		return responseDto;
	}

	private PolicyLeaveTypeResponseDto toPolicyLeaveTypeResponseDto(PolicyLeaveType policyLeaveType) {
		PolicyLeaveTypeResponseDto responseDto = new PolicyLeaveTypeResponseDto();
		responseDto.setTypeId(policyLeaveType.getTypeId());
		responseDto.setName(policyLeaveType.getName());
		responseDto.setEmojiCode(policyLeaveType.getEmojiCode());
		responseDto.setColorCode(policyLeaveType.getColorCode());
		return responseDto;
	}

}
