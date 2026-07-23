package com.skapp.community.leaveplanner.service.impl;

import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.constant.LeaveMessageConstant;
import com.skapp.community.leaveplanner.mapper.LeaveMapper;
import com.skapp.community.leaveplanner.model.EmployeeLeavePolicy;
import com.skapp.community.leaveplanner.model.LeavePolicy;
import com.skapp.community.leaveplanner.payload.request.AssignLeavePolicyRequestDto;
import com.skapp.community.leaveplanner.payload.request.UnassignLeavePolicyRequestDto;
import com.skapp.community.leaveplanner.payload.response.EmployeeLeavePolicyResponseDto;
import com.skapp.community.leaveplanner.repository.EmployeeLeavePolicyDao;
import com.skapp.community.leaveplanner.repository.LeavePolicyDao;
import com.skapp.community.leaveplanner.service.EmployeeLeavePolicyService;
import com.skapp.community.leaveplanner.type.EffectiveDateType;
import com.skapp.community.leaveplanner.type.EmployeeLeavePolicyEndedReason;
import com.skapp.community.leaveplanner.type.EmployeeLeavePolicyStatus;
import com.skapp.community.leaveplanner.type.LeavePolicyStatus;
import com.skapp.community.leaveplanner.type.PolicyType;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmployeeLeavePolicyServiceImpl implements EmployeeLeavePolicyService {

	private final EmployeeLeavePolicyDao employeeLeavePolicyDao;

	private final LeavePolicyDao leavePolicyDao;

	private final EmployeeDao employeeDao;

	private final LeaveMapper leaveMapper;

	@Override
	@Transactional
	public ResponseEntityDto assignLeavePolicy(AssignLeavePolicyRequestDto assignLeavePolicyRequestDto) {
		log.info("assignLeavePolicy: execution started for employee {} policy {}",
				assignLeavePolicyRequestDto.getEmployeeId(), assignLeavePolicyRequestDto.getPolicyId());

		Employee employee = getEmployeeOrThrow(assignLeavePolicyRequestDto.getEmployeeId());

		LeavePolicy policy = leavePolicyDao.findById(assignLeavePolicyRequestDto.getPolicyId())
			.orElseThrow(() -> new EntityNotFoundException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_NOT_FOUND));

		if (policy.getStatus() != LeavePolicyStatus.ACTIVE) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_NOT_ACTIVE);
		}

		// This phase supports accrual policies only; flexible allocation is out of scope.
		if (policy.getPolicyType() != PolicyType.ACCRUAL) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_NOT_ACCRUAL);
		}

		LocalDate effectiveFrom = resolveEffectiveFrom(assignLeavePolicyRequestDto, employee);

		// Conflict rule: at most one open window per (employee, leave type). Close any
		// existing
		// open window of the same leave type before opening the new one
		// (last-write-wins).
		Long leaveTypeId = policy.getLeaveType().getTypeId();
		employeeLeavePolicyDao
			.findByEmployee_EmployeeIdAndPolicy_LeaveType_TypeIdAndStatus(employee.getEmployeeId(), leaveTypeId,
					EmployeeLeavePolicyStatus.ACTIVE)
			.ifPresent(openWindow -> closeWindow(openWindow, effectiveFrom.minusDays(1),
					EmployeeLeavePolicyEndedReason.SUPERSEDED));

		EmployeeLeavePolicy assignment = new EmployeeLeavePolicy();
		assignment.setEmployee(employee);
		assignment.setPolicy(policy);
		assignment.setEffectiveDateType(assignLeavePolicyRequestDto.getEffectiveDateType());
		assignment.setEffectiveFrom(effectiveFrom);
		assignment.setStatus(EmployeeLeavePolicyStatus.ACTIVE);
		assignment = employeeLeavePolicyDao.save(assignment);

		log.info("assignLeavePolicy: policy {} assigned to employee {} effective {}", policy.getPolicyId(),
				employee.getEmployeeId(), effectiveFrom);

		EmployeeLeavePolicyResponseDto responseDto = leaveMapper
			.employeeLeavePolicyToEmployeeLeavePolicyResponseDto(assignment);
		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	@Transactional
	public ResponseEntityDto unassignLeavePolicy(UnassignLeavePolicyRequestDto unassignLeavePolicyRequestDto) {
		log.info("unassignLeavePolicy: execution started for employee {} policy {}",
				unassignLeavePolicyRequestDto.getEmployeeId(), unassignLeavePolicyRequestDto.getPolicyId());

		// Idempotent: if there is no open window for this (employee, policy) the call is
		// a
		// no-op and still succeeds. History rows are never hard-deleted, so a replay must
		// not
		// fail with "not found".
		employeeLeavePolicyDao
			.findByEmployee_EmployeeIdAndPolicy_PolicyIdAndStatus(unassignLeavePolicyRequestDto.getEmployeeId(),
					unassignLeavePolicyRequestDto.getPolicyId(), EmployeeLeavePolicyStatus.ACTIVE)
			.ifPresentOrElse(
					openWindow -> closeWindow(openWindow, LocalDate.now(), EmployeeLeavePolicyEndedReason.UNASSIGNED),
					() -> log.info("unassignLeavePolicy: no open window found; treating as no-op"));

		log.info("unassignLeavePolicy: execution ended");
		return getEmployeeLeavePolicies(unassignLeavePolicyRequestDto.getEmployeeId());
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getEmployeeLeavePolicies(Long employeeId) {
		log.info("getEmployeeLeavePolicies: execution started for employee {}", employeeId);

		getEmployeeOrThrow(employeeId);

		List<EmployeeLeavePolicy> activeAssignments = employeeLeavePolicyDao
			.findByEmployee_EmployeeIdAndStatusOrderByEffectiveFromDesc(employeeId, EmployeeLeavePolicyStatus.ACTIVE);

		List<EmployeeLeavePolicyResponseDto> responseDtos = leaveMapper
			.employeeLeavePolicyListToEmployeeLeavePolicyResponseDtoList(activeAssignments);

		log.info("getEmployeeLeavePolicies: returning {} active assignment(s)", responseDtos.size());
		return new ResponseEntityDto(false, responseDtos);
	}

	@Override
	@Transactional
	public int endOpenWindowsForPolicy(Long policyId) {
		List<EmployeeLeavePolicy> openWindows = employeeLeavePolicyDao.findByPolicy_PolicyIdAndStatus(policyId,
				EmployeeLeavePolicyStatus.ACTIVE);
		LocalDate today = LocalDate.now();
		openWindows.forEach(window -> closeWindow(window, today, EmployeeLeavePolicyEndedReason.POLICY_DEACTIVATED));
		if (!openWindows.isEmpty()) {
			log.info("endOpenWindowsForPolicy: closed {} open window(s) for policy {}", openWindows.size(), policyId);
		}
		return openWindows.size();
	}

	/**
	 * Close a window: cap {@code effectiveTo} so it never precedes {@code effectiveFrom}
	 * (which would be an invalid range when a window is superseded/unassigned on or
	 * before its own start date), then mark it {@code ENDED}.
	 */
	private void closeWindow(EmployeeLeavePolicy window, LocalDate proposedEffectiveTo,
			EmployeeLeavePolicyEndedReason reason) {
		LocalDate effectiveTo = proposedEffectiveTo.isBefore(window.getEffectiveFrom()) ? window.getEffectiveFrom()
				: proposedEffectiveTo;
		window.setEffectiveTo(effectiveTo);
		window.setStatus(EmployeeLeavePolicyStatus.ENDED);
		window.setEndedReason(reason);
		employeeLeavePolicyDao.save(window);
	}

	private LocalDate resolveEffectiveFrom(AssignLeavePolicyRequestDto dto, Employee employee) {
		if (dto.getEffectiveDateType() == EffectiveDateType.SPECIFIC) {
			if (dto.getSpecificDate() == null) {
				throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_SPECIFIC_DATE_REQUIRED);
			}
			return dto.getSpecificDate();
		}

		// HIRE_DATE
		if (employee.getJoinDate() == null) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_HIRE_DATE_UNAVAILABLE);
		}
		return employee.getJoinDate();
	}

	private Employee getEmployeeOrThrow(Long employeeId) {
		return employeeDao.findByEmployeeId(employeeId)
			.orElseThrow(() -> new EntityNotFoundException(LeaveMessageConstant.LEAVE_ERROR_EMPLOYEE_NOT_FOUND));
	}

}
