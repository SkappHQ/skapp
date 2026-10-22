package com.skapp.community.crmplanner.activity.payload.response;

import com.skapp.community.crmplanner.activity.util.CrmActivityFeedUtil;

public record CrmActivityPersonResponseDto(Long id, String name, String avatar) {

	public CrmActivityPersonResponseDto(Long id, String firstName, String lastName, String avatar) {
		this(id, CrmActivityFeedUtil.toFullName(firstName, lastName), avatar);
	}

}
