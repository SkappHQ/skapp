package com.skapp.community.crmplanner.payload.request;

import tools.jackson.databind.annotation.JsonDeserialize;
import com.skapp.community.crmplanner.type.CrmDealPriority;
import com.skapp.community.crmplanner.type.CrmDealSort;
import com.skapp.enterprise.common.config.TrimmingStringDeserializer;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

@Getter
@Setter
public class CrmDealFilterDto {

	private int page = 0;

	private int size = 10;

	private Sort.Direction sortOrder = Sort.Direction.ASC;

	private CrmDealSort sortKey = CrmDealSort.STAGE_ORDER;

	@JsonDeserialize(using = TrimmingStringDeserializer.class)
	private String searchKeyword;

	private Long stageId;

	private CrmDealPriority priority;

}
