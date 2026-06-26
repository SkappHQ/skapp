package com.skapp.community.peopleplanner.payload.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TeamsRequestDto {

	@Schema(description = "Team names.")
	@NotEmpty
	private List<String> teamNames;

}
