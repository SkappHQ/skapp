package com.skapp.community.crmplanner.payload.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CrmActivityFeedLinkResponseDto {

	private Long id;

	private String name;

	private boolean deleted;

}
