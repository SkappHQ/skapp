package com.skapp.community.leaveplanner.service.impl;

import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.BulkStatusSummaryDto;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.common.util.StringUtils;
import com.skapp.community.leaveplanner.constant.LeaveMessageConstant;
import com.skapp.community.leaveplanner.constant.LeavePolicyConstant;
import com.skapp.community.leaveplanner.mapper.LeaveMapper;
import com.skapp.community.leaveplanner.model.EmployeeLeavePolicy;
import com.skapp.community.leaveplanner.model.LeavePolicy;
import com.skapp.community.leaveplanner.payload.PolicyLeaveBalanceDto;
import com.skapp.community.leaveplanner.payload.request.AssignLeavePolicyRequestDto;
import com.skapp.community.leaveplanner.payload.request.BulkAssignLeavePolicyRequestDto;
import com.skapp.community.leaveplanner.payload.request.BulkAssignPolicyRowDto;
import com.skapp.community.leaveplanner.payload.request.EmployeeLeavePolicyFilterDto;
import com.skapp.community.leaveplanner.payload.request.UnassignLeavePolicyRequestDto;
import com.skapp.community.leaveplanner.payload.response.BulkAssignErrorLogDto;
import com.skapp.community.leaveplanner.payload.response.BulkAssignResponseDto;
import com.skapp.community.leaveplanner.payload.response.EmployeeLeavePolicyResponseDto;
import com.skapp.community.leaveplanner.repository.EmployeeLeavePolicyDao;
import com.skapp.community.leaveplanner.repository.LeavePolicyDao;
import com.skapp.community.leaveplanner.service.EmployeeLeavePolicyService;
import com.skapp.community.leaveplanner.service.PolicyLeaveService;
import com.skapp.community.leaveplanner.type.EffectiveDateType;
import com.skapp.community.leaveplanner.type.PolicyType;
import com.skapp.community.leaveplanner.util.EmployeeLeavePolicyUtil;
import com.skapp.community.leaveplanner.type.EmployeeLeavePolicyStatus;
import com.skapp.community.leaveplanner.type.LeavePolicyStatus;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmployeeLeavePolicyServiceImpl implements EmployeeLeavePolicyService {

	private final EmployeeLeavePolicyDao employeeLeavePolicyDao;

	private final LeavePolicyDao leavePolicyDao;

	private final EmployeeDao employeeDao;

	private final LeaveMapper leaveMapper;

	private final PolicyLeaveService policyLeaveService;

	private final MessageUtil messageUtil;

	private final PlatformTransactionManager transactionManager;

	@Override
	@Transactional
	public ResponseEntityDto assignLeavePolicy(AssignLeavePolicyRequestDto assignLeavePolicyRequestDto) {
		log.info("assignLeavePolicy: execution started");

		EmployeeLeavePolicyUtil.validateRequiredFields(assignLeavePolicyRequestDto);

		Employee employee = employeeDao.findByEmployeeId(assignLeavePolicyRequestDto.getEmployeeId())
			.orElseThrow(() -> new EntityNotFoundException(LeaveMessageConstant.LEAVE_ERROR_EMPLOYEE_NOT_FOUND));

		LeavePolicy policy = leavePolicyDao.findById(assignLeavePolicyRequestDto.getPolicyId())
			.orElseThrow(() -> new EntityNotFoundException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_NOT_FOUND));

		if (policy.getStatus() != LeavePolicyStatus.ACTIVE) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_NOT_ACTIVE);
		}

		LocalDate effectiveFrom = EmployeeLeavePolicyUtil.resolveEffectiveFrom(assignLeavePolicyRequestDto, employee);
		EmployeeLeavePolicy currentActiveAssignment = employeeLeavePolicyDao
			.findByEmployee_EmployeeIdAndPolicy_LeaveType_IdAndStatus(employee.getEmployeeId(),
					policy.getLeaveType().getId(), EmployeeLeavePolicyStatus.ACTIVE)
			.orElse(null);
		EmployeeLeavePolicy employeeLeavePolicy = assignPolicyToEmployee(employee, policy, effectiveFrom,
				assignLeavePolicyRequestDto.getEffectiveDateType(), currentActiveAssignment);

		log.info("assignLeavePolicy: execution ended");
		return new ResponseEntityDto(false,
				leaveMapper.employeeLeavePolicyToEmployeeLeavePolicyResponseDto(employeeLeavePolicy));
	}

	@Override
	public ResponseEntityDto bulkAssignLeavePolicies(BulkAssignLeavePolicyRequestDto bulkAssignLeavePolicyRequestDto) {
		log.info("bulkAssignLeavePolicies: execution started");

		List<BulkAssignPolicyRowDto> assignmentRows = bulkAssignLeavePolicyRequestDto.getAssignments() != null
				? bulkAssignLeavePolicyRequestDto.getAssignments() : List.of();
		if (assignmentRows.size() > LeavePolicyConstant.MAX_BULK_ASSIGN_ROWS) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_BULK_ROW_LIMIT_EXCEEDED,
					new String[] { String.valueOf(LeavePolicyConstant.MAX_BULK_ASSIGN_ROWS) });
		}
		if (assignmentRows.isEmpty()) {
			log.info("bulkAssignLeavePolicies: execution ended");
			return new ResponseEntityDto(false, buildBulkAssignResponse(List.of(), new BulkStatusSummaryDto()));
		}

		Set<String> employeeNames = assignmentRows.stream()
			.map(row -> StringUtils.normalizeName(row.getEmployeeName()))
			.collect(Collectors.toSet());
		Set<String> policyNames = assignmentRows.stream()
			.map(row -> StringUtils.normalizeName(row.getPolicyName()))
			.collect(Collectors.toSet());

		Map<String, List<Employee>> employeesByName = employeeDao.findActiveEmployeesByExactNames(employeeNames)
			.stream()
			.collect(Collectors.groupingBy(employee -> StringUtils.normalizeName(employee.getFullName())));

		Map<String, List<LeavePolicy>> policiesByName = leavePolicyDao
			.findByNamesIgnoreCaseAndStatus(policyNames, LeavePolicyStatus.ACTIVE)
			.stream()
			.collect(Collectors.groupingBy(policy -> StringUtils.normalizeName(policy.getName())));

		List<Long> employeeIds = employeesByName.values()
			.stream()
			.flatMap(List::stream)
			.map(Employee::getEmployeeId)
			.toList();
		List<EmployeeLeavePolicy> currentActiveAssignments = employeeIds.isEmpty() ? List.of()
				: employeeLeavePolicyDao.findByEmployeeIdsAndStatus(employeeIds, EmployeeLeavePolicyStatus.ACTIVE);
		Map<EmployeeLeaveTypeKey, EmployeeLeavePolicy> activeAssignments = currentActiveAssignments.stream()
			.collect(Collectors.toMap(assignment -> new EmployeeLeaveTypeKey(assignment.getEmployee().getEmployeeId(),
					assignment.getPolicy().getLeaveType().getId()), assignment -> assignment));

		List<BulkAssignErrorLogDto> errorLogs = new ArrayList<>();
		BulkStatusSummaryDto summary = new BulkStatusSummaryDto();
		Set<EmployeeLeaveTypeKey> processedEmployeeLeaveTypes = new HashSet<>();
		TransactionTemplate transactionTemplate = new TransactionTemplate(transactionManager);

		for (int rowIndex = 0; rowIndex < assignmentRows.size(); rowIndex++) {
			BulkAssignPolicyRowDto row = assignmentRows.get(rowIndex);
			String error;
			try {
				error = transactionTemplate.execute(status -> validateAndAssignRow(row, employeesByName, policiesByName,
						activeAssignments, processedEmployeeLeaveTypes));
			}
			catch (Exception exception) {
				log.error("bulkAssignLeavePolicies: unexpected failure for row {}", rowIndex, exception);
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

		log.info("bulkAssignLeavePolicies: execution ended");
		return new ResponseEntityDto(false, buildBulkAssignResponse(errorLogs, summary));
	}

	@Override
	@Transactional
	public ResponseEntityDto unassignLeavePolicy(UnassignLeavePolicyRequestDto unassignLeavePolicyRequestDto) {
		log.info("unassignLeavePolicy: execution started");

		EmployeeLeavePolicyUtil.validateRequiredFields(unassignLeavePolicyRequestDto);

		EmployeeLeavePolicy activeEmployeeLeavePolicy = employeeLeavePolicyDao
			.findByEmployee_EmployeeIdAndPolicy_IdAndStatus(unassignLeavePolicyRequestDto.getEmployeeId(),
					unassignLeavePolicyRequestDto.getPolicyId(), EmployeeLeavePolicyStatus.ACTIVE)
			.orElseThrow(() -> new ModuleException(LeaveMessageConstant.LEAVE_ERROR_EMPLOYEE_LEAVE_POLICY_NOT_FOUND));

		markEmployeeLeavePolicyEnded(activeEmployeeLeavePolicy);

		log.info("unassignLeavePolicy: execution ended");
		return new ResponseEntityDto(false,
				leaveMapper.employeeLeavePolicyToEmployeeLeavePolicyResponseDto(activeEmployeeLeavePolicy));
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getEmployeeLeavePolicies(Long employeeId, EmployeeLeavePolicyFilterDto filterDto) {
		log.info("getEmployeeLeavePolicies: execution started");

		Pageable pageable = filterDto.getSize() < 0 ? Pageable.unpaged()
				: PageRequest.of(filterDto.getPage(), filterDto.getSize());
		Page<EmployeeLeavePolicy> activeEmployeeLeavePolicies = employeeLeavePolicyDao
			.findByEmployee_EmployeeIdAndStatusOrderByEffectiveFromDesc(employeeId, EmployeeLeavePolicyStatus.ACTIVE,
					pageable);

		int currentYear = DateTimeUtils.getCurrentUtcDate().getYear();
		List<EmployeeLeavePolicyResponseDto> items = activeEmployeeLeavePolicies.getContent()
			.stream()
			.map(assignment -> toEmployeeLeavePolicyWithBalance(assignment, currentYear))
			.toList();

		PageDto pageDto = new PageDto();
		pageDto.setItems(items);
		pageDto.setCurrentPage(activeEmployeeLeavePolicies.getNumber());
		pageDto.setTotalItems(activeEmployeeLeavePolicies.getTotalElements());
		pageDto.setTotalPages(activeEmployeeLeavePolicies.getTotalPages());

		log.info("getEmployeeLeavePolicies: execution ended");
		return new ResponseEntityDto(false, pageDto);
	}

	/**
	 * Adds the same derived leave balance the apply leave flow shows on its policy cards,
	 * so the assigned policy cards report the employee's remaining days for the current
	 * leave cycle instead of leaving the balance blank.
	 */
	private EmployeeLeavePolicyResponseDto toEmployeeLeavePolicyWithBalance(EmployeeLeavePolicy assignment, int year) {
		EmployeeLeavePolicyResponseDto responseDto = leaveMapper
			.employeeLeavePolicyToEmployeeLeavePolicyResponseDto(assignment);

		PolicyLeaveBalanceDto balance = policyLeaveService.calculateBalanceForYear(assignment, year);
		responseDto.setTotalDaysAllocated(balance.getTotalDaysAllocated());
		responseDto.setTotalDaysUsed(balance.getTotalDaysUsed());
		responseDto.setBalanceInDays(balance.getBalanceInDays());
		responseDto.setIsUnlimited(balance.isUnlimited());
		return responseDto;
	}

	private String validateAndAssignRow(BulkAssignPolicyRowDto row, Map<String, List<Employee>> employeesByName,
			Map<String, List<LeavePolicy>> policiesByName,
			Map<EmployeeLeaveTypeKey, EmployeeLeavePolicy> activeAssignments,
			Set<EmployeeLeaveTypeKey> processedEmployeeLeaveTypes) {
		List<Employee> employees = employeesByName.getOrDefault(StringUtils.normalizeName(row.getEmployeeName()),
				List.of());
		if (employees.isEmpty()) {
			return messageUtil.getMessage(LeaveMessageConstant.LEAVE_ERROR_BULK_EMPLOYEE_NOT_FOUND,
					new String[] { row.getEmployeeName() });
		}
		if (employees.size() > 1) {
			return messageUtil.getMessage(LeaveMessageConstant.LEAVE_ERROR_BULK_EMPLOYEE_MULTIPLE_FOUND,
					new String[] { row.getEmployeeName() });
		}
		Employee employee = employees.getFirst();

		List<LeavePolicy> policies = policiesByName.getOrDefault(StringUtils.normalizeName(row.getPolicyName()),
				List.of());
		if (policies.isEmpty()) {
			return messageUtil.getMessage(LeaveMessageConstant.LEAVE_ERROR_BULK_POLICY_NOT_FOUND,
					new String[] { row.getPolicyName() });
		}
		if (policies.size() > 1) {
			return messageUtil.getMessage(LeaveMessageConstant.LEAVE_ERROR_BULK_POLICY_MULTIPLE_FOUND,
					new String[] { row.getPolicyName() });
		}
		LeavePolicy policy = policies.getFirst();
		if (policy.getPolicyType() != PolicyType.ACCRUAL) {
			return messageUtil.getMessage(LeaveMessageConstant.LEAVE_ERROR_BULK_POLICY_NOT_ACCRUAL,
					new String[] { row.getPolicyName() });
		}

		EmployeeLeaveTypeKey employeeLeaveTypeKey = new EmployeeLeaveTypeKey(employee.getEmployeeId(),
				policy.getLeaveType().getId());
		if (processedEmployeeLeaveTypes.contains(employeeLeaveTypeKey)) {
			return messageUtil.getMessage(LeaveMessageConstant.LEAVE_ERROR_BULK_DUPLICATE_ROW,
					new String[] { employee.getFullName(), policy.getLeaveType().getName() });
		}

		EffectiveDateType effectiveDateType;
		LocalDate effectiveFrom;
		if (StringUtils.isNullOrBlank(row.getEffectiveDate())) {
			if (employee.getJoinDate() == null) {
				return messageUtil.getMessage(LeaveMessageConstant.LEAVE_ERROR_BULK_HIRE_DATE_UNAVAILABLE,
						new String[] { row.getEmployeeName() });
			}
			effectiveDateType = EffectiveDateType.JOIN_DATE;
			effectiveFrom = employee.getJoinDate();
		}
		else {
			effectiveFrom = DateTimeUtils.parseDayMonthYearDate(row.getEffectiveDate());
			if (effectiveFrom == null) {
				return messageUtil.getMessage(LeaveMessageConstant.LEAVE_ERROR_BULK_INVALID_DATE);
			}
			effectiveDateType = EffectiveDateType.SPECIFIC;
		}

		assignPolicyToEmployee(employee, policy, effectiveFrom, effectiveDateType,
				activeAssignments.get(employeeLeaveTypeKey));
		processedEmployeeLeaveTypes.add(employeeLeaveTypeKey);
		return null;
	}

	private EmployeeLeavePolicy assignPolicyToEmployee(Employee employee, LeavePolicy policy, LocalDate effectiveFrom,
			EffectiveDateType effectiveDateType, EmployeeLeavePolicy currentActiveAssignment) {
		if (currentActiveAssignment != null) {
			if (currentActiveAssignment.getPolicy().getId().equals(policy.getId())
					&& effectiveFrom.equals(currentActiveAssignment.getEffectiveFrom())
					&& currentActiveAssignment.getEffectiveDateType() == effectiveDateType) {
				return currentActiveAssignment;
			}
			markEmployeeLeavePolicyEnded(currentActiveAssignment);
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

	private BulkAssignResponseDto buildBulkAssignResponse(List<BulkAssignErrorLogDto> errorLogs,
			BulkStatusSummaryDto summary) {
		BulkAssignResponseDto response = new BulkAssignResponseDto();
		response.setBulkRecordErrorLogs(errorLogs);
		response.setBulkStatusSummary(summary);
		return response;
	}

	private record EmployeeLeaveTypeKey(Long employeeId, Long leaveTypeId) {
	}

}
