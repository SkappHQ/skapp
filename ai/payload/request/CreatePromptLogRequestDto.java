package com.skapp.enterprise.ai.payload.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreatePromptLogRequestDto {

	@NotNull
	private Long userId;

}
