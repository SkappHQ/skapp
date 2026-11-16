package com.skapp.community.crmplanner.type;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

import java.time.Instant;
import java.util.List;

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

	private List<Long> relatedContactIds;

	private Long relatedDealId;

	private Long excludedId;

	private Integer maxResults;

	private CrmActivityAssociation activityAssociation;

	private Long recordId;

	private CrmActivityType activityType;

}
