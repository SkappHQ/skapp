package com.skapp.community.leaveplanner.service.impl;

import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.constant.LeaveMessageConstant;
import com.skapp.community.leaveplanner.mapper.LeaveMapper;
import com.skapp.community.leaveplanner.model.EmployeeLeavePolicy;
import com.skapp.community.leaveplanner.model.LeavePolicy;
import com.skapp.community.leaveplanner.payload.request.AssignLeavePolicyRequestDto;
import com.skapp.community.leaveplanner.payload.request.EmployeeLeavePolicyFilterDto;
import com.skapp.community.leaveplanner.payload.request.UnassignLeavePolicyRequestDto;
import com.skapp.community.leaveplanner.payload.response.EmployeeLeavePolicyResponseDto;
import com.skapp.community.leaveplanner.repository.EmployeeLeavePolicyDao;
import com.skapp.community.leaveplanner.repository.LeavePolicyDao;
import com.skapp.community.leaveplanner.service.EmployeeLeavePolicyService;
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
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

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

		Long leaveTypeId = policy.getLeaveType().getId();
		EmployeeLeavePolicy activeEmployeeLeavePolicy = employeeLeavePolicyDao
			.findByEmployee_EmployeeIdAndPolicy_LeaveType_IdAndStatus(employee.getEmployeeId(), leaveTypeId,
					EmployeeLeavePolicyStatus.ACTIVE)
			.orElse(null);

		if (activeEmployeeLeavePolicy != null) {
			if (activeEmployeeLeavePolicy.getPolicy().getId().equals(policy.getId())
					&& effectiveFrom.equals(activeEmployeeLeavePolicy.getEffectiveFrom()) && activeEmployeeLeavePolicy
						.getEffectiveDateType() == assignLeavePolicyRequestDto.getEffectiveDateType()) {
				return new ResponseEntityDto(false,
						leaveMapper.employeeLeavePolicyToEmployeeLeavePolicyResponseDto(activeEmployeeLeavePolicy));
			}
			markEmployeeLeavePolicyEnded(activeEmployeeLeavePolicy);
		}

		EmployeeLeavePolicy employeeLeavePolicy = new EmployeeLeavePolicy();
		employeeLeavePolicy.setEmployee(employee);
		employeeLeavePolicy.setPolicy(policy);
		employeeLeavePolicy.setEffectiveDateType(assignLeavePolicyRequestDto.getEffectiveDateType());
		employeeLeavePolicy.setEffectiveFrom(effectiveFrom);
		employeeLeavePolicy.setStatus(EmployeeLeavePolicyStatus.ACTIVE);
		employeeLeavePolicy = employeeLeavePolicyDao.save(employeeLeavePolicy);

		log.info("assignLeavePolicy: execution ended");
		return new ResponseEntityDto(false,
				leaveMapper.employeeLeavePolicyToEmployeeLeavePolicyResponseDto(employeeLeavePolicy));
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
		return getEmployeeLeavePolicies(unassignLeavePolicyRequestDto.getEmployeeId(),
				new EmployeeLeavePolicyFilterDto());
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

	private void markEmployeeLeavePolicyEnded(EmployeeLeavePolicy employeeLeavePolicy) {
		employeeLeavePolicy.setStatus(EmployeeLeavePolicyStatus.ENDED);
		employeeLeavePolicyDao.save(employeeLeavePolicy);
	}

}
