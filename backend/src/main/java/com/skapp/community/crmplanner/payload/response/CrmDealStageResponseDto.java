package com.skapp.community.crmplanner.payload.response;

import com.skapp.community.crmplanner.type.CrmDealStageType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmDealStageResponseDto {

	private Long id;

	private String name;

	private String color;

	private Integer orderIndex;

	private String description;

	private CrmDealStageType stageType;

}
