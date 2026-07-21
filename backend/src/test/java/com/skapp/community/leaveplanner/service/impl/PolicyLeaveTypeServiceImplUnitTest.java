package com.skapp.community.leaveplanner.service.impl;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.mapper.LeaveMapper;
import com.skapp.community.leaveplanner.model.PolicyLeaveType;
import com.skapp.community.leaveplanner.payload.response.PolicyLeaveTypeResponseDto;
import com.skapp.community.leaveplanner.repository.PolicyLeaveTypeDao;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("Policy Leave Type Service Unit Tests")
class PolicyLeaveTypeServiceImplUnitTest {

	private PolicyLeaveTypeServiceImpl policyLeaveTypeService;

	@Mock
	private PolicyLeaveTypeDao policyLeaveTypeDao;

	@Mock
	private LeaveMapper leaveMapper;

	@BeforeEach
	void setup() {
		policyLeaveTypeService = new PolicyLeaveTypeServiceImpl(policyLeaveTypeDao, leaveMapper);
	}

	private PolicyLeaveType buildLeaveType() {
		PolicyLeaveType leaveType = new PolicyLeaveType();
		leaveType.setTypeId(1L);
		leaveType.setName("Annual");
		return leaveType;
	}

	@Test
	@DisplayName("Returns the active leave types")
	void getPolicyLeaveTypes_ActiveTypesExist_ReturnsMappedTypes() {
		when(policyLeaveTypeDao.findAllByIsActive(true)).thenReturn(List.of(buildLeaveType()));
		when(leaveMapper.policyLeaveTypeListToPolicyLeaveTypeResponseDtoList(anyList()))
			.thenReturn(List.of(new PolicyLeaveTypeResponseDto()));

		ResponseEntityDto response = policyLeaveTypeService.getPolicyLeaveTypes();

		assertEquals("successful", response.getStatus());
		assertEquals(1, response.getResults().size());
	}

}
