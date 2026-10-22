package com.skapp.community.crmplanner.activity.payload.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CrmActivityLinkResponseDto {

	private final Long id;

	private final String name;

	private final Boolean deleted;

}
