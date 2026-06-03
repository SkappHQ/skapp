package com.skapp.community.crmplanner.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum DefaultCrmDealStageValues {

	LEAD("Lead", CrmDealStageColors.SKY, 1, CrmDealStageType.INITIAL),
	QUALIFIED("Qualified", CrmDealStageColors.APRICOT, 2, CrmDealStageType.OPEN),
	DEMO_SCHEDULED("Demo Scheduled", CrmDealStageColors.TEAL, 3, CrmDealStageType.OPEN),
	PROPOSAL_SENT("Proposal Sent", CrmDealStageColors.LAVENDER, 4, CrmDealStageType.OPEN),
	NEGOTIATION("Negotiation", CrmDealStageColors.SUNSHINE, 3, CrmDealStageType.OPEN),
	WON("Deal Won", CrmDealStageColors.LIME, 4, CrmDealStageType.WON),
	LOST("Deal Lost", CrmDealStageColors.ROSEWOOD, 5, CrmDealStageType.LOST);

	private final String name;

	private final CrmDealStageColors color;

	private final int orderIndex;

	private final CrmDealStageType stageType;

}
