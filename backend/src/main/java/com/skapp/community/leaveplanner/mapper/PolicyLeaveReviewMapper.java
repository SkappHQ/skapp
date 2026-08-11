package com.skapp.community.leaveplanner.mapper;

import com.skapp.community.leaveplanner.model.PolicyLeaveRequest;
import com.skapp.community.leaveplanner.payload.response.PolicyLeaveRequestManagerDetailResponseDto;
import com.skapp.community.leaveplanner.payload.response.PolicyLeaveRequestManagerResponseDto;
import org.mapstruct.IterableMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PolicyLeaveReviewMapper {

	@Mapping(target = "leaveRequestId", source = "id")
	@Mapping(target = "policyId", source = "policy.id")
	@Mapping(target = "policyName", source = "policy.name")
	@Mapping(target = "leaveType", source = "policy.leaveType")
	PolicyLeaveRequestManagerResponseDto policyLeaveRequestToPolicyLeaveRequestManagerResponseDto(
			PolicyLeaveRequest policyLeaveRequest);

	@IterableMapping(elementTargetType = PolicyLeaveRequestManagerResponseDto.class)
	List<PolicyLeaveRequestManagerResponseDto> policyLeaveRequestListToPolicyLeaveRequestManagerResponseDtoList(
			List<PolicyLeaveRequest> policyLeaveRequests);

	@Mapping(target = "leaveRequestId", source = "id")
	@Mapping(target = "policyId", source = "policy.id")
	@Mapping(target = "policyName", source = "policy.name")
	@Mapping(target = "leaveType", source = "policy.leaveType")
	PolicyLeaveRequestManagerDetailResponseDto policyLeaveRequestToPolicyLeaveRequestManagerDetailResponseDto(
			PolicyLeaveRequest policyLeaveRequest);

}
