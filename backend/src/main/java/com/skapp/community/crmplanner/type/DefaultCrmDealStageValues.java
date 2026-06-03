package com.skapp.community.crmplanner.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum DefaultCrmDealStageValues {

	LEAD("Lead", CrmDealStageColours.SKY, 1, CrmDealStageType.INITIAL),
	QUALIFIED("Qualified", CrmDealStageColours.APRICOT, 2, CrmDealStageType.OPEN),
	DEMO_SCHEDULED("Demo Scheduled", CrmDealStageColours.TEAL, 3, CrmDealStageType.OPEN),
	PROPOSAL_SENT("Proposal Sent", CrmDealStageColours.LAVENDER, 4, CrmDealStageType.OPEN),
	NEGOTIATION("Negotiation", CrmDealStageColours.SUNSHINE, 3, CrmDealStageType.OPEN),
	WON("Deal Won", CrmDealStageColours.LIME, 4, CrmDealStageType.WON),
	LOST("Deal Lost", CrmDealStageColours.ROSEWOOD, 5, CrmDealStageType.LOST);

	private final String name;

	private final CrmDealStageColours color;

	private final int orderIndex;

	private final CrmDealStageType stageType;

}
