package com.skapp.enterprise.common.payload.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ApplySupportRequestDto {

	private String issueType;

	private String details;

	private List<String> attachments;

}
