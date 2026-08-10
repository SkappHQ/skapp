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
import com.skapp.community.leaveplanner.payload.request.AssignLeavePolicyRequestDto;
import com.skapp.community.leaveplanner.payload.request.BulkAssignLeavePolicyRequestDto;
import com.skapp.community.leaveplanner.payload.request.BulkAssignPolicyRowDto;
import com.skapp.community.leaveplanner.payload.request.EmployeeLeavePolicyFilterDto;
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
import java.util.Objects;
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

	private final MessageUtil messageUtil;

	private final PlatformTransactionManager transactionManager;

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

		Set<String> employeeEmails = assignmentRows.stream()
			.map(row -> normalizeEmail(row.getEmployeeEmail()))
			.filter(email -> !email.isEmpty())
			.collect(Collectors.toSet());
		Set<Long> policyIds = assignmentRows.stream()
			.map(row -> parsePolicyId(row.getPolicyId()))
			.filter(Objects::nonNull)
			.collect(Collectors.toSet());

		Map<String, Employee> employeesByEmail = employeeEmails.isEmpty() ? Map.of()
				: employeeDao.findActiveEmployeesByEmails(employeeEmails)
					.stream()
					.collect(Collectors.toMap(employee -> normalizeEmail(employee.getUser().getEmail()),
							employee -> employee, (existing, duplicate) -> existing));

		Map<Long, LeavePolicy> policiesById = policyIds.isEmpty() ? Map.of()
				: leavePolicyDao.findByIdsWithLeaveType(policyIds)
					.stream()
					.collect(Collectors.toMap(LeavePolicy::getId, policy -> policy));

		List<Long> employeeIds = employeesByEmail.values().stream().map(Employee::getEmployeeId).toList();
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
				error = transactionTemplate.execute(status -> validateAndAssignRow(row, employeesByEmail, policiesById,
						activeAssignments, processedEmployeeLeaveTypes));
			}
			catch (Exception exception) {
				log.error("bulkAssignLeavePolicies: unexpected failure for row {}", rowIndex, exception);
				error = messageUtil.getMessage(LeaveMessageConstant.LEAVE_ERROR_BULK_ROW_FAILED);
			}

			if (error != null) {
				BulkAssignErrorLogDto errorLog = new BulkAssignErrorLogDto();
				errorLog.setEmployeeEmail(row.getEmployeeEmail());
				errorLog.setPolicyId(row.getPolicyId());
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

		Pageable pageable = PageRequest.of(filterDto.getPage(), filterDto.getSize());
		Page<EmployeeLeavePolicy> activeEmployeeLeavePolicies = employeeLeavePolicyDao
			.findByEmployee_EmployeeIdAndStatusOrderByEffectiveFromDesc(employeeId, EmployeeLeavePolicyStatus.ACTIVE,
					pageable);

		PageDto pageDto = new PageDto();
		pageDto.setItems(leaveMapper
			.employeeLeavePolicyListToEmployeeLeavePolicyResponseDtoList(activeEmployeeLeavePolicies.getContent()));
		pageDto.setCurrentPage(activeEmployeeLeavePolicies.getNumber());
		pageDto.setTotalItems(activeEmployeeLeavePolicies.getTotalElements());
		pageDto.setTotalPages(activeEmployeeLeavePolicies.getTotalPages());

		log.info("getEmployeeLeavePolicies: execution ended");
		return new ResponseEntityDto(false, pageDto);
	}

	private String validateAndAssignRow(BulkAssignPolicyRowDto row, Map<String, Employee> employeesByEmail,
			Map<Long, LeavePolicy> policiesById, Map<EmployeeLeaveTypeKey, EmployeeLeavePolicy> activeAssignments,
			Set<EmployeeLeaveTypeKey> processedEmployeeLeaveTypes) {
		if (StringUtils.isNullOrBlank(row.getEmployeeEmail())) {
			return messageUtil.getMessage(LeaveMessageConstant.LEAVE_ERROR_BULK_EMPLOYEE_EMAIL_REQUIRED);
		}
		Employee employee = employeesByEmail.get(normalizeEmail(row.getEmployeeEmail()));
		if (employee == null) {
			return messageUtil.getMessage(LeaveMessageConstant.LEAVE_ERROR_BULK_EMPLOYEE_NOT_FOUND,
					new String[] { row.getEmployeeEmail().trim() });
		}

		if (StringUtils.isNullOrBlank(row.getPolicyId())) {
			return messageUtil.getMessage(LeaveMessageConstant.LEAVE_ERROR_BULK_POLICY_ID_REQUIRED);
		}
		Long policyId = parsePolicyId(row.getPolicyId());
		if (policyId == null) {
			return messageUtil.getMessage(LeaveMessageConstant.LEAVE_ERROR_BULK_INVALID_POLICY_ID,
					new String[] { row.getPolicyId().trim() });
		}
		LeavePolicy policy = policiesById.get(policyId);
		if (policy == null) {
			return messageUtil.getMessage(LeaveMessageConstant.LEAVE_ERROR_BULK_POLICY_NOT_FOUND,
					new String[] { String.valueOf(policyId) });
		}
		if (policy.getStatus() != LeavePolicyStatus.ACTIVE) {
			return messageUtil.getMessage(LeaveMessageConstant.LEAVE_ERROR_BULK_POLICY_INACTIVE,
					new String[] { policy.getName() });
		}
		if (policy.getPolicyType() != PolicyType.ACCRUAL) {
			return messageUtil.getMessage(LeaveMessageConstant.LEAVE_ERROR_BULK_POLICY_NOT_ACCRUAL,
					new String[] { policy.getName() });
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
						new String[] { employee.getFullName() });
			}
			effectiveDateType = EffectiveDateType.HIRE_DATE;
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

	private static String normalizeEmail(String email) {
		return email == null ? "" : email.trim().toLowerCase();
	}

	private static Long parsePolicyId(String policyId) {
		try {
			return policyId == null ? null : Long.valueOf(policyId.trim());
		}
		catch (NumberFormatException exception) {
			return null;
		}
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
