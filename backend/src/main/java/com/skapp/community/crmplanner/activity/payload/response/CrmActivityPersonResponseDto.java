package com.skapp.community.crmplanner.activity.payload.response;

import com.skapp.community.crmplanner.activity.util.CrmActivityFeedUtil;
import lombok.Getter;

@Getter
public class CrmActivityPersonResponseDto {

	private final Long id;

	private final String name;

	private final String avatar;

	public CrmActivityPersonResponseDto(Long id, String firstName, String lastName, String avatar) {
		this.id = id;
		this.name = CrmActivityFeedUtil.toFullName(firstName, lastName);
		this.avatar = avatar;
	}

}
