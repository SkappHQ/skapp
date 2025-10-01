package com.skapp.enterprise.pm.payload;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReleasePdfRequestDto {

	@NotBlank
	private String projectKey;

	@NotNull
	private Long releaseId;

}