package com.skapp.community.crmplanner.payload.request;

import com.skapp.community.crmplanner.type.CrmDealPriority;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmDealEditRequestDto {

	private String name;

	private String description;

	private Long stageId;

	private CrmDealPriority priority;

	private String amount;

	private String contactName;

	private String companyName;

	private Long ownerId;

}
