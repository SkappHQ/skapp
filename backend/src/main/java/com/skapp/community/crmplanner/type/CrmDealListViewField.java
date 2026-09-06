package com.skapp.community.crmplanner.type;

import com.fasterxml.jackson.annotation.JsonAlias;

public enum CrmDealListViewField {

	@JsonAlias("DEAL_NAME")
	NAME,

	@JsonAlias("VALUE")
	AMOUNT,

	STAGE,

	@JsonAlias("COMPANY_NAME")
	COMPANY,

	@JsonAlias("CONTACT_NAME")
	CONTACT,

	PRIORITY,

	@JsonAlias("DEAL_OWNER")
	OWNER

}
