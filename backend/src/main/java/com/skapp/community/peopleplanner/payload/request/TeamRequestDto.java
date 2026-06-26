package com.skapp.community.peopleplanner.payload.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Set;

@Data
public class TeamRequestDto {

	@NotNull
	@Size(min = 1, max = 50)
	@Schema(description = "The name of the team. Cannot be null.", example = "skapp")
	private String teamName;

	@NotNull
	@Schema(description = "The team member ID list. Cannot be null.")
	private Set<Long> teamMembers;

	@NotEmpty
	@Schema(description = "The team supervisor ID list. Cannot be null.")
	private Set<Long> teamSupervisors;

}
