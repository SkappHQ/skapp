package com.skapp.community.leaveplanner.service.impl;

import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.BulkStatusSummaryDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.leaveplanner.constant.LeaveMessageConstant;
import com.skapp.community.leaveplanner.mapper.LeaveMapper;
import com.skapp.community.leaveplanner.model.EmployeeLeavePolicy;
import com.skapp.community.leaveplanner.model.LeavePolicy;
import com.skapp.community.leaveplanner.payload.request.AssignLeavePolicyRequestDto;
import com.skapp.community.leaveplanner.payload.request.BulkAssignLeavePolicyRequestDto;
import com.skapp.community.leaveplanner.payload.request.BulkAssignPolicyRowDto;
import com.skapp.community.leaveplanner.payload.request.UnassignLeavePolicyRequestDto;
import com.skapp.community.leaveplanner.payload.response.BulkAssignErrorLogDto;
import com.skapp.community.leaveplanner.payload.response.BulkAssignResponseDto;
import com.skapp.community.leaveplanner.repository.EmployeeLeavePolicyDao;
import com.skapp.community.leaveplanner.repository.LeavePolicyDao;
import com.skapp.community.leaveplanner.service.EmployeeLeavePolicyService;
import com.skapp.community.leaveplanner.type.EffectiveDateType;
import com.skapp.community.leaveplanner.util.EmployeeLeavePolicyUtil;
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
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmployeeLeavePolicyServiceImpl implements EmployeeLeavePolicyService {

	private final EmployeeLeavePolicyDao employeeLeavePolicyDao;

	private final LeavePolicyDao leavePolicyDao;

	private final EmployeeDao employeeDao;

	private final LeaveMapper leaveMapper;

	private final MessageUtil messageUtil;

	@Override
	@Transactional
	public ResponseEntityDto assignLeavePolicy(AssignLeavePolicyRequestDto assignLeavePolicyRequestDto) {
		log.info("assignLeavePolicy: execution started");

		Employee employee = employeeDao.findByEmployeeId(assignLeavePolicyRequestDto.getEmployeeId())
			.orElseThrow(() -> new EntityNotFoundException(LeaveMessageConstant.LEAVE_ERROR_EMPLOYEE_NOT_FOUND));

		LeavePolicy policy = leavePolicyDao.findById(assignLeavePolicyRequestDto.getPolicyId())
			.orElseThrow(() -> new EntityNotFoundException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_NOT_FOUND));

		if (policy.getStatus() != LeavePolicyStatus.ACTIVE) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_NOT_ACTIVE);
		}

		if (policy.getPolicyType() != PolicyType.ACCRUAL) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_NOT_ACCRUAL);
		}

		LocalDate effectiveFrom = EmployeeLeavePolicyUtil.resolveEffectiveFrom(assignLeavePolicyRequestDto, employee);
		EmployeeLeavePolicy employeeLeavePolicy = assignSingle(employee, policy, effectiveFrom,
				assignLeavePolicyRequestDto.getEffectiveDateType());

		log.info("assignLeavePolicy: execution ended");
		return new ResponseEntityDto(false,
				leaveMapper.employeeLeavePolicyToEmployeeLeavePolicyResponseDto(employeeLeavePolicy));
	}

	@Override
	@Transactional
	public ResponseEntityDto bulkAssignLeavePolicies(BulkAssignLeavePolicyRequestDto bulkAssignLeavePolicyRequestDto) {
		log.info("bulkAssignLeavePolicies: execution started");

		List<BulkAssignPolicyRowDto> rows = bulkAssignLeavePolicyRequestDto.getAssignments() != null
				? bulkAssignLeavePolicyRequestDto.getAssignments() : Collections.emptyList();

		List<BulkAssignErrorLogDto> errorLogs = new ArrayList<>();
		BulkStatusSummaryDto summary = new BulkStatusSummaryDto();
		Set<String> processedEmployeeLeaveTypes = new HashSet<>();

		for (BulkAssignPolicyRowDto row : rows) {
			String error;
			try {
				error = validateAndAssignRow(row, processedEmployeeLeaveTypes);
			}
			catch (Exception exception) {
				log.error("bulkAssignLeavePolicies: unexpected row failure - {}", exception.getMessage());
				error = messageUtil.getMessage(LeaveMessageConstant.LEAVE_ERROR_BULK_ROW_FAILED);
			}

			if (error != null) {
				BulkAssignErrorLogDto errorLog = new BulkAssignErrorLogDto();
				errorLog.setEmployeeName(row.getEmployeeName());
				errorLog.setPolicyName(row.getPolicyName());
				errorLog.setEffectiveDate(row.getEffectiveDate());
				errorLog.setError(error);
				errorLogs.add(errorLog);
				summary.incrementFailedCount();
			}
			else {
				summary.incrementSuccessCount();
			}
		}

		BulkAssignResponseDto response = new BulkAssignResponseDto();
		response.setBulkRecordErrorLogs(errorLogs);
		response.setBulkStatusSummary(summary);

		log.info("bulkAssignLeavePolicies: execution ended");
		return new ResponseEntityDto(false, response);
	}

	@Override
	@Transactional
	public ResponseEntityDto unassignLeavePolicy(UnassignLeavePolicyRequestDto unassignLeavePolicyRequestDto) {
		log.info("unassignLeavePolicy: execution started");

		EmployeeLeavePolicy activeEmployeeLeavePolicy = employeeLeavePolicyDao
			.findByEmployee_EmployeeIdAndPolicy_IdAndStatus(unassignLeavePolicyRequestDto.getEmployeeId(),
					unassignLeavePolicyRequestDto.getPolicyId(), EmployeeLeavePolicyStatus.ACTIVE)
			.orElseThrow(() -> new ModuleException(LeaveMessageConstant.LEAVE_ERROR_EMPLOYEE_LEAVE_POLICY_NOT_FOUND));

		markEmployeeLeavePolicyEnded(activeEmployeeLeavePolicy);

		log.info("unassignLeavePolicy: execution ended");
		return getEmployeeLeavePolicies(unassignLeavePolicyRequestDto.getEmployeeId());
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getEmployeeLeavePolicies(Long employeeId) {
		log.info("getEmployeeLeavePolicies: execution started");

		List<EmployeeLeavePolicy> activeEmployeeLeavePolicies = employeeLeavePolicyDao
			.findByEmployee_EmployeeIdAndStatusOrderByEffectiveFromDesc(employeeId, EmployeeLeavePolicyStatus.ACTIVE);

		log.info("getEmployeeLeavePolicies: execution ended");
		return new ResponseEntityDto(false,
				leaveMapper.employeeLeavePolicyListToEmployeeLeavePolicyResponseDtoList(activeEmployeeLeavePolicies));
	}

	private String validateAndAssignRow(BulkAssignPolicyRowDto row, Set<String> processedEmployeeLeaveTypes) {
		String employeeName = EmployeeLeavePolicyUtil.sanitizeCsvCell(row.getEmployeeName());
		String policyName = EmployeeLeavePolicyUtil.sanitizeCsvCell(row.getPolicyName());
		String effectiveDateValue = EmployeeLeavePolicyUtil.sanitizeCsvCell(row.getEffectiveDate());

		List<Employee> employees = employeeDao.findActiveEmployeesByExactName(employeeName);
		if (employees.isEmpty()) {
			return messageUtil.getMessage(LeaveMessageConstant.LEAVE_ERROR_BULK_EMPLOYEE_NOT_FOUND,
					new Object[] { employeeName });
		}
		if (employees.size() > 1) {
			return messageUtil.getMessage(LeaveMessageConstant.LEAVE_ERROR_BULK_EMPLOYEE_MULTIPLE_FOUND);
		}
		Employee employee = employees.get(0);

		List<LeavePolicy> policies = leavePolicyDao.findByNameIgnoreCaseAndStatus(policyName, LeavePolicyStatus.ACTIVE);
		if (policies.isEmpty()) {
			return messageUtil.getMessage(LeaveMessageConstant.LEAVE_ERROR_BULK_POLICY_NOT_FOUND,
					new Object[] { policyName });
		}
		LeavePolicy policy = policies.get(0);
		if (policy.getPolicyType() != PolicyType.ACCRUAL) {
			return messageUtil.getMessage(LeaveMessageConstant.LEAVE_ERROR_BULK_POLICY_NOT_ACCRUAL,
					new Object[] { policyName });
		}

		LocalDate effectiveFrom = EmployeeLeavePolicyUtil.parseBulkEffectiveDate(effectiveDateValue);
		if (effectiveFrom == null) {
			return messageUtil.getMessage(LeaveMessageConstant.LEAVE_ERROR_BULK_INVALID_DATE);
		}

		String duplicateKey = employee.getEmployeeId() + ":" + policy.getLeaveType().getId();
		if (processedEmployeeLeaveTypes.contains(duplicateKey)) {
			return messageUtil.getMessage(LeaveMessageConstant.LEAVE_ERROR_BULK_DUPLICATE_ROW,
					new Object[] { employee.getFullName(), policy.getLeaveType().getName() });
		}

		assignSingle(employee, policy, effectiveFrom, EffectiveDateType.SPECIFIC);
		processedEmployeeLeaveTypes.add(duplicateKey);
		return null;
	}

	private EmployeeLeavePolicy assignSingle(Employee employee, LeavePolicy policy, LocalDate effectiveFrom,
			EffectiveDateType effectiveDateType) {
		Long leaveTypeId = policy.getLeaveType().getId();
		EmployeeLeavePolicy activeEmployeeLeavePolicy = employeeLeavePolicyDao
			.findByEmployee_EmployeeIdAndPolicy_LeaveType_IdAndStatus(employee.getEmployeeId(), leaveTypeId,
					EmployeeLeavePolicyStatus.ACTIVE)
			.orElse(null);

		if (activeEmployeeLeavePolicy != null) {
			if (activeEmployeeLeavePolicy.getPolicy().getId().equals(policy.getId())
					&& effectiveFrom.equals(activeEmployeeLeavePolicy.getEffectiveFrom())
					&& activeEmployeeLeavePolicy.getEffectiveDateType() == effectiveDateType) {
				return activeEmployeeLeavePolicy;
			}
			markEmployeeLeavePolicyEnded(activeEmployeeLeavePolicy);
		}

		EmployeeLeavePolicy employeeLeavePolicy = new EmployeeLeavePolicy();
		employeeLeavePolicy.setEmployee(employee);
		employeeLeavePolicy.setPolicy(policy);
		employeeLeavePolicy.setEffectiveDateType(effectiveDateType);
		employeeLeavePolicy.setEffectiveFrom(effectiveFrom);
		employeeLeavePolicy.setStatus(EmployeeLeavePolicyStatus.ACTIVE);
		return employeeLeavePolicyDao.save(employeeLeavePolicy);
	}

	private void markEmployeeLeavePolicyEnded(EmployeeLeavePolicy employeeLeavePolicy) {
		employeeLeavePolicy.setStatus(EmployeeLeavePolicyStatus.ENDED);
		employeeLeavePolicyDao.save(employeeLeavePolicy);
	}

}
