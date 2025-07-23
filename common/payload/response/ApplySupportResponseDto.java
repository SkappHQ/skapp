package com.skapp.enterprise.common.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ApplySupportResponseDto {

	private String issueType;

	private String details;

	private List<SupportRequestAttachmentDto> attachments;

}
