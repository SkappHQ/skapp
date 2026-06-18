package com.skapp.community.crmplanner.type;

import java.util.List;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class DefaultCrmDealStageValues {

	private final CrmDealStageName stage;

	private final CrmDealStageColors color;

	private final int orderIndex;

	private final CrmDealStageType stageType;

	public static final List<DefaultCrmDealStageValues> DEFAULT_STAGES = List.of(
			new DefaultCrmDealStageValues(CrmDealStageName.LEAD, CrmDealStageColors.SKY, 1, CrmDealStageType.INITIAL),
			new DefaultCrmDealStageValues(CrmDealStageName.QUALIFIED, CrmDealStageColors.APRICOT, 2,
					CrmDealStageType.OPEN),
			new DefaultCrmDealStageValues(CrmDealStageName.DEMO_SCHEDULED, CrmDealStageColors.TEAL, 3,
					CrmDealStageType.OPEN),
			new DefaultCrmDealStageValues(CrmDealStageName.PROPOSAL_SENT, CrmDealStageColors.LAVENDER, 4,
					CrmDealStageType.OPEN),
			new DefaultCrmDealStageValues(CrmDealStageName.NEGOTIATION, CrmDealStageColors.SUNSHINE, 5,
					CrmDealStageType.OPEN),
			new DefaultCrmDealStageValues(CrmDealStageName.WON, CrmDealStageColors.LIME, 6, CrmDealStageType.WON),
			new DefaultCrmDealStageValues(CrmDealStageName.LOST, CrmDealStageColors.ROSEWOOD, 7,
					CrmDealStageType.LOST));

}
