package com.skapp.community.crmplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmDealStageReorderRequestDto {

	private Long id;

	private Integer orderIndex;

}
