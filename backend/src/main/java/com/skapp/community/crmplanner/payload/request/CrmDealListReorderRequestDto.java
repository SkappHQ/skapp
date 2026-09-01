package com.skapp.community.crmplanner.payload.request;

import com.skapp.community.crmplanner.type.CrmDealView;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmDealListReorderRequestDto {

	private CrmDealView view;

	private Long dealId;

	private Long previousDealId;

	private Long nextDealId;

}
