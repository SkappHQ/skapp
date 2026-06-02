package com.skapp.community.crmplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CrmDealsByStageResponseDto {

	private Long stageId;

	private long totalCount;

	private int currentPage;

	private int totalPages;

	private int pageSize;

	private boolean hasNextPage;

	private List<CrmDealByStageItemResponseDto> deals;

}
