package com.skapp.enterprise.common.payload.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class EpGuestUserBulkInviteRequestDto {

	@NotEmpty
	private List<String> emails;

	private List<ProjectRequestDto> projects;

}
