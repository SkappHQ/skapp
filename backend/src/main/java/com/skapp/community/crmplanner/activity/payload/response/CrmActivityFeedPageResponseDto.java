package com.skapp.community.crmplanner.activity.payload.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class CrmActivityFeedPageResponseDto {

	private final List<CrmActivityFeedRowResponseDto> items;

	private final int page;

	private final boolean hasMore;

}
