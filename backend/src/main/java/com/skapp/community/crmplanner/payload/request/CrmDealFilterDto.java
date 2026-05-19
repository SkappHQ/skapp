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

	private Sort.Direction sortOrder = Sort.Direction.DESC;

	private CrmDealSort sortKey = CrmDealSort.CREATED_DATE;

	private String searchKeyword;

	private Long stageId;

	private CrmDealPriority priority;

	public Sort.Direction getSortOrder() {
		return sortOrder != null ? sortOrder : Sort.Direction.DESC;
	}

	public CrmDealSort getSortKey() {
		return sortKey != null ? sortKey : CrmDealSort.CREATED_DATE;
	}

}
