package com.skapp.community.crmplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmDealDetailResponseDto {

	private Long id;

	private String name;

	private String amount;

	private CrmDealStageResponseDto stage;

	private String description;

	private CrmOwnerResponseDto owner;

}
