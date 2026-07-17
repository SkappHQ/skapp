package com.skapp.community.leaveplanner.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LeavePolicyUpdateRequestDto {

	@NotBlank(message = "Policy name is required")
	@Size(max = 100, message = "Policy name cannot exceed 100 characters")
	private String name;

}
