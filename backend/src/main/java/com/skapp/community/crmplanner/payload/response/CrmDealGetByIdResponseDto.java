package com.skapp.community.crmplanner.payload.response;

import com.skapp.community.crmplanner.type.CrmDealPriority;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmDealViewResponseDto {

	private Long id;

	private String name;

	private String amount;

	private Long stageId;

	private String description;

	private CrmOwnerResponseDto owner;

	private CrmDealPriority priority;

	private CrmContactLookupResponseDto contact;

}
