package com.skapp.community.crmplanner.payload.request;

import com.skapp.community.crmplanner.type.CrmDealPriority;
import com.skapp.community.crmplanner.type.CrmDealSort;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

@Getter
@Setter
public class CrmDealFilterDto {

	private int page = 0;

	private int size = 10;

	private Sort.Direction sortOrder = Sort.Direction.ASC;

	// Null = no active column sort; the list view then falls back to the saved row
	// (crm_deal_order_index.list) order. Set to a column key to apply that sort.
	private CrmDealSort sortKey;

	private String searchKeyword;

	private Long stageId;

	private CrmDealPriority priority;

	private Long companyId;

	private Long contactId;

}
