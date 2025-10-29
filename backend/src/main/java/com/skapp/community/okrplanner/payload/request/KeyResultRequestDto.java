package com.skapp.community.okrplanner.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.List;

@Data
public class KeyResultRequestDto {

	@NotBlank(message = "Key result title is required")
	@Size(max = 250, message = "Title cannot exceed 250 characters")
	private String title;

	@NotBlank(message = "Key result type is required")
	private String type;

	private Double lowerLimit;

	private Double upperLimit;

	@NotEmpty(message = "Assigned teams are required")
	private List<Long> assignedTeamIds;

}