package com.skapp.community.crmplanner.activity.payload.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class CrmActivityFeedResponseDto {

	private final List<CrmActivityFeedRowResponseDto> overdue;

	private final List<CrmActivityFeedRowResponseDto> today;

	private final List<CrmActivityFeedRowResponseDto> upcoming;

	private final CrmActivityFeedPageResponseDto byMonth;

}
