package com.skapp.community.crmplanner.payload.response;

import com.skapp.community.crmplanner.type.CrmDealPriority;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmDealResponseDto {

	private Long id;

	private String name;

	private String description;

	private CrmDealStageResponseDto stage;

	private CrmDealPriority priority;

	private String orderIndex;

	private String amount;

	private String companyName;

	private CrmContactLookupResponseDto contact;

	private CrmOwnerResponseDto owner;

}
