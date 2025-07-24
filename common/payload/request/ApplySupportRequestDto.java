package com.skapp.enterprise.common.payload.request;

import com.skapp.enterprise.common.type.SupportRequestIssueType;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ApplySupportRequestDto {

	private SupportRequestIssueType issueType;

	private String details;

	private List<String> attachments;

}
