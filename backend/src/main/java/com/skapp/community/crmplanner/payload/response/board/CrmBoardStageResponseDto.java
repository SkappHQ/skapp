package com.skapp.community.crmplanner.payload.response.board;

import com.skapp.community.crmplanner.type.CrmDealStageType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmBoardStageResponseDto {

	private Long id;

	private String name;

	private String color;

	private Integer orderIndex;

	private CrmDealStageType stageType;

}
