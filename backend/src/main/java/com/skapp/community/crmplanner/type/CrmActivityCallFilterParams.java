package com.skapp.community.crmplanner.type;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.data.domain.Sort;

import java.time.Instant;

@Getter
@AllArgsConstructor
public class CrmActivityCallFilterParams {

	private final CrmActivityScope scope;

	private final Long currentEmployeeId;

	private final Long ownerId;

	private final String searchKeyword;

	private final Instant loggedFrom;

	private final Instant loggedBefore;

	private final CrmActivityCallSort sortKey;

	private final Sort.Direction sortOrder;

}
