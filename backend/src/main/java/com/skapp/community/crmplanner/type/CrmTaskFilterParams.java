package com.skapp.community.crmplanner.type;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CrmTaskFilterParams {

	private final Long ownerId;

	private final Boolean completed;

	private final String searchKeyword;

	private final Long contactId;

	private final Long dealId;

	private final Long companyId;

}
