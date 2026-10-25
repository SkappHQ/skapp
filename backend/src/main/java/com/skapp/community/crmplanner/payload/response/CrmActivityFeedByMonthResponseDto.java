package com.skapp.community.crmplanner.payload.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class CrmActivityFeedByMonthResponseDto {

	private List<CrmActivityFeedRowResponseDto> items;

	private int page;

	private boolean hasMore;

}
