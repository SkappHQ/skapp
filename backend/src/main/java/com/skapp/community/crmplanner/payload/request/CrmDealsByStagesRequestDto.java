package com.skapp.community.crmplanner.payload.request;

import com.skapp.community.crmplanner.constant.CrmConstants;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
public class CrmDealsByStagesRequestDto {

	private List<Long> stageIds;

	private String searchKeyword;

	private Map<Long, Integer> stagePages;

	private int limit = CrmConstants.DEALS_PER_STAGE_LIMIT;

}
