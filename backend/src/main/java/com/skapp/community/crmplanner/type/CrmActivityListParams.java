package com.skapp.community.crmplanner.type;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

import java.time.Instant;

@Getter
@Setter
public class CrmActivityListParams {

	private Long currentEmployeeId;

	private Boolean isRestrictedToOwner;

	private Long ownerId;

	private String searchPattern;

	private Instant rangeStart;

	private Instant rangeEnd;

	private Sort.Direction sortOrder;

}
