package com.skapp.community.crmplanner.type;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CrmTaskLinkRefs {

	private final Long ownerId;

	private final Long contactId;

	private final Long dealId;

}
