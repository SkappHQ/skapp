package com.skapp.community.peopleplanner.payload.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TeamPatchRequestDto {

	@Schema(description = "The name of the team.")
	private String teamName;

	@Schema(description = "The team member ID list.")
	private List<Long> teamMembers;

	@Schema(description = "The team supervisor ID list. Cannot be null.")
	private List<Long> teamSupervisors;

}
