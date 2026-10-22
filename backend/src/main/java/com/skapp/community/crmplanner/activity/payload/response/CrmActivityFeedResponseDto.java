package com.skapp.community.crmplanner.activity.payload.response;

import java.util.List;

public record CrmActivityFeedResponseDto(List<CrmActivityFeedRowResponseDto> overdue,
		List<CrmActivityFeedRowResponseDto> today, List<CrmActivityFeedRowResponseDto> upcoming,
		CrmActivityFeedPageResponseDto byMonth) {

}
