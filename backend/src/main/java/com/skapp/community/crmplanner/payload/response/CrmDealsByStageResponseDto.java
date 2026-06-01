package com.skapp.community.crmplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CrmDealsByStageResponseDto {

	private Long stageId;

	private String stageName;

	private String stageColor;

	private long totalCount;

	private List<CrmDealResponseDto> deals;

}
