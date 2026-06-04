package com.skapp.community.crmplanner.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum CrmDealStageName {

	LEAD("Lead"), QUALIFIED("Qualified"), DEMO_SCHEDULED("Demo Scheduled"), PROPOSAL_SENT("Proposal Sent"),
	NEGOTIATION("Negotiation"), WON("Deal Won"), LOST("Deal Lost");

	private final String name;

}
