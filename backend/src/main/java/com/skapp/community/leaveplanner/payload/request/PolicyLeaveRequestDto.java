package com.skapp.community.leaveplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PolicyLeaveRequestDto extends PolicyLeaveAvailabilityRequestDto {

	private String requestDesc;

	private List<PolicyLeaveAttachmentDto> attachments;

}
