package com.skapp.community.crmplanner.payload.response.board;

import com.skapp.community.crmplanner.type.CrmDealPriority;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmDealByStageItemResponseDto {

	private Long id;

	private String name;

	private String amount;

	private Long ownerId;

	private Long companyId;

	private Long contactId;

	private CrmDealPriority priority;

	private Long taskCount;

}
