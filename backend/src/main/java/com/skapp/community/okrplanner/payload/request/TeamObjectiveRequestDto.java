package com.skapp.community.okrplanner.payload.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.List;

@Data
public class TeamObjectiveRequestDto {

	@NotBlank(message = "Title is required")
	@Size(max = 250, message = "Title cannot exceed 250 characters")
	private String title;

	@Size(max = 1000, message = "Description cannot exceed 1000 characters")
	private String description;

	@NotNull(message = "Effective time period is required")
	private Long effectiveTimePeriod;

	private String duration;

	private Long companyObjectiveId;

	@NotEmpty(message = "At least one team must be assigned")
	private List<Long> assignedTeamIds;

	private List<@Valid KeyResultRequestDto> keyResults;

}
