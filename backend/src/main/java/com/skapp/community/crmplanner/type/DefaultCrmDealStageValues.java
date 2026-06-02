package com.skapp.community.crmplanner.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum DefaultCrmDealStageValues {

	NEW("New", "#60a5fa", 1, CrmDealStageType.INITIAL), QUALIFIED("Qualified", "#fde047", 2, CrmDealStageType.OPEN),
	IN_PROGRESS("In Progress", "#ff9f40", 3, CrmDealStageType.OPEN), WON("Won", "#83a0a0", 4, CrmDealStageType.WON),
	LOST("Lost", "#ff3e3e", 5, CrmDealStageType.LOST);

	private final String name;

	private final String color;

	private final int orderIndex;

	private final CrmDealStageType stageType;

}
