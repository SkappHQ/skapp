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

		// Acquire a pessimistic lock on the employee row FIRST, before any other read, so
		// concurrent assigns for the same employee serialize. Being the first DB access
		// also
		// means the conflict re-read below runs only after any competing transaction has
		// committed, so the "one open window per leave type" check sees up-to-date data.
		Employee employee = getEmployeeForUpdateOrThrow(assignLeavePolicyRequestDto.getEmployeeId());

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

		// Conflict rule: at most one open window per (employee, leave type).
		Long leaveTypeId = policy.getLeaveType().getId();
		EmployeeLeavePolicy openWindow = employeeLeavePolicyDao
			.findByEmployee_EmployeeIdAndPolicy_LeaveType_IdAndStatus(employee.getEmployeeId(), leaveTypeId,
					EmployeeLeavePolicyStatus.ACTIVE)
			.orElse(null);

		if (openWindow != null) {
			// Re-assigning the exact same policy on the same effective date is a no-op;
			// return
			// the existing window rather than churning history with a SUPERSEDED row.
			if (openWindow.getPolicy().getId().equals(policy.getId())
					&& effectiveFrom.equals(openWindow.getEffectiveFrom())
					&& openWindow.getEffectiveDateType() == assignLeavePolicyRequestDto.getEffectiveDateType()) {
				log.info("assignLeavePolicy: identical assignment already active; treating as no-op");
				return new ResponseEntityDto(false,
						leaveMapper.employeeLeavePolicyToEmployeeLeavePolicyResponseDto(openWindow));
			}
			// A different policy (or the same policy re-dated) supersedes the current
			// window
			// (last-write-wins), in the same transaction as the insert below.
			closeWindow(openWindow, effectiveFrom.minusDays(1), EmployeeLeavePolicyEndedReason.SUPERSEDED);
		}

		EmployeeLeavePolicy assignment = new EmployeeLeavePolicy();
		assignment.setEmployee(employee);
		assignment.setPolicy(policy);
		assignment.setEffectiveDateType(assignLeavePolicyRequestDto.getEffectiveDateType());
		assignment.setEffectiveFrom(effectiveFrom);
		assignment.setStatus(EmployeeLeavePolicyStatus.ACTIVE);
		assignment = employeeLeavePolicyDao.save(assignment);

		log.info("assignLeavePolicy: policy {} assigned to employee {} effective {}", policy.getId(),
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

		getEmployeeOrThrow(unassignLeavePolicyRequestDto.getEmployeeId());

		EmployeeLeavePolicy openWindow = employeeLeavePolicyDao
			.findByEmployee_EmployeeIdAndPolicy_IdAndStatus(unassignLeavePolicyRequestDto.getEmployeeId(),
					unassignLeavePolicyRequestDto.getPolicyId(), EmployeeLeavePolicyStatus.ACTIVE)
			.orElseThrow(() -> new EntityNotFoundException(
					LeaveMessageConstant.LEAVE_ERROR_EMPLOYEE_LEAVE_POLICY_NOT_FOUND));

		closeWindow(openWindow, LocalDate.now(), EmployeeLeavePolicyEndedReason.UNASSIGNED);

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
		List<EmployeeLeavePolicy> openWindows = employeeLeavePolicyDao.findByPolicy_IdAndStatus(policyId,
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

	private Employee getEmployeeForUpdateOrThrow(Long employeeId) {
		return employeeDao.findWithLockByEmployeeId(employeeId)
			.orElseThrow(() -> new EntityNotFoundException(LeaveMessageConstant.LEAVE_ERROR_EMPLOYEE_NOT_FOUND));
	}

}
