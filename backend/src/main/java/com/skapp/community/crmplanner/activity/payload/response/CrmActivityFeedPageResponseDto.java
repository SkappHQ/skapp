package com.skapp.community.crmplanner.activity.payload.response;

import java.util.List;

public record CrmActivityFeedPageResponseDto(List<CrmActivityFeedRowResponseDto> items, int page, boolean hasMore) {

}
