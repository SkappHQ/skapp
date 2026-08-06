package com.skapp.community.leaveplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PolicyLeaveAttachmentResponseDto {

	private Long id;

	private String fileUrl;

	private String originalFileName;

}
