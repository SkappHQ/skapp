package com.skapp.community.leaveplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PolicyLeaveRequestManagerDetailResponseDto extends PolicyLeaveRequestManagerResponseDto {

	private List<PolicyLeaveAttachmentResponseDto> attachments;

}
