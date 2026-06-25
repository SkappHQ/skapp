package com.skapp.community.crmplanner.payload.request;

import com.skapp.community.crmplanner.type.CrmDealStageColors;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmDealStageEditRequestDto {

	private String name;

	private String description;

	private CrmDealStageColors color;

}
