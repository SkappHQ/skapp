package com.skapp.community.crmplanner.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum CrmDealStageName {

	LEAD("LEAD"), QUALIFIED("QUALIFIED"), DEMO_SCHEDULED("DEMO_SCHEDULED"), PROPOSAL_SENT("PROPOSAL_SENT"),
	NEGOTIATION("NEGOTIATION"), WON("WON"), LOST("LOST");

	private final String name;

}
