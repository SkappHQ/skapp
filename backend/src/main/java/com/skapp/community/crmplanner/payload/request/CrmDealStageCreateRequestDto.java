package com.skapp.community.crmplanner.payload.request;

import com.skapp.community.crmplanner.type.CrmDealStageColors;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmDealStageCreateRequestDto {

	private String name;

	private CrmDealStageColors color;

	private String description;

}
