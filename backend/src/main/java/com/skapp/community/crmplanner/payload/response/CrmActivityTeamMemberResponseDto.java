package com.skapp.community.crmplanner.payload.response;

import lombok.Getter;

@Getter
public class CrmActivityTeamMemberResponseDto {

	private final Long id;

	private final String name;

	private final String avatar;

	public CrmActivityTeamMemberResponseDto(Long id, String firstName, String lastName, String avatar) {
		this.id = id;
		this.name = (firstName == null ? "" : firstName) + (lastName == null ? "" : " " + lastName);
		this.avatar = avatar;
	}

}
