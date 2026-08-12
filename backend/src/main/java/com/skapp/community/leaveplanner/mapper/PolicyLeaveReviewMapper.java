package com.skapp.community.leaveplanner.mapper;

import com.skapp.community.leaveplanner.model.PolicyLeaveRequest;
import com.skapp.community.leaveplanner.payload.response.PolicyLeaveRequestManagerDetailResponseDto;
import com.skapp.community.leaveplanner.payload.response.PolicyLeaveRequestManagerResponseDto;
import org.mapstruct.InheritConfiguration;
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

	/**
	 * {@code elementTargetType} is the tiebreaker, not decoration. Because the detail DTO
	 * extends the list DTO, both single object methods below qualify as the element
	 * mapper; without it MapStruct either fails with an ambiguous mapping or picks the
	 * detail method, which would map {@code attachments} and load that collection per
	 * row.
	 */
	@IterableMapping(elementTargetType = PolicyLeaveRequestManagerResponseDto.class)
	List<PolicyLeaveRequestManagerResponseDto> policyLeaveRequestListToPolicyLeaveRequestManagerResponseDtoList(
			List<PolicyLeaveRequest> policyLeaveRequests);

	@InheritConfiguration(name = "policyLeaveRequestToPolicyLeaveRequestManagerResponseDto")
	PolicyLeaveRequestManagerDetailResponseDto policyLeaveRequestToPolicyLeaveRequestManagerDetailResponseDto(
			PolicyLeaveRequest policyLeaveRequest);

}
