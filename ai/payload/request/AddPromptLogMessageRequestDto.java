package com.skapp.enterprise.ai.payload.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddPromptLogMessageRequestDto {

	@NotNull
	private Long promptLogId;

	private String userMessage;

	private String aiMessage;

}
