package com.skapp.enterprise.common.payload.request;

import com.skapp.enterprise.common.type.SupportRequestIssueType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ApplySupportRequestDto {

	@NotNull
	private SupportRequestIssueType issueType;

	@NotBlank(message = "Details cannot be blank.")
	@Size(max = 1000, message = "Details cannot exceed 1000 characters.")
	private String details;

	private List<String> attachments;

}
