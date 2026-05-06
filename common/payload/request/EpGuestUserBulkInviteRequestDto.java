package com.skapp.enterprise.common.payload.request;

import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class EpGuestUserBulkInviteRequestDto {

	private List<@Email String> emails;

	private List<ProjectRequestDto> projects;

	private Long currentUserId;

}
