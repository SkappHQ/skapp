package com.skapp.community.leaveplanner.service.impl;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.mapper.LeaveMapper;
import com.skapp.community.leaveplanner.payload.response.PolicyLeaveTypeResponseDto;
import com.skapp.community.leaveplanner.payload.response.PolicyLeaveTypesResponseDto;
import com.skapp.community.leaveplanner.repository.PolicyLeaveTypeDao;
import com.skapp.community.leaveplanner.service.PolicyLeaveTypeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PolicyLeaveTypeServiceImpl implements PolicyLeaveTypeService {

	private final PolicyLeaveTypeDao policyLeaveTypeDao;

	private final LeaveMapper leaveMapper;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getPolicyLeaveTypes() {
		log.info("getPolicyLeaveTypes: execution started");

		List<PolicyLeaveTypeResponseDto> leaveTypes = leaveMapper
			.policyLeaveTypeListToPolicyLeaveTypeResponseDtoList(policyLeaveTypeDao.findAllByIsActive(true));

		log.info("getPolicyLeaveTypes: execution ended");
		return new ResponseEntityDto(false, new PolicyLeaveTypesResponseDto(leaveTypes));
	}

}
