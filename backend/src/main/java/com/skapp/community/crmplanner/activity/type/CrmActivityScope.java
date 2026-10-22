package com.skapp.community.crmplanner.activity.type;

import com.skapp.community.common.type.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Set;

@Getter
@AllArgsConstructor
public class CrmActivityScope {

	private final Long viewerId;

	private final Role role;

	private final boolean orgWide;

	private final Set<Long> ownerIds;

	public boolean canFilter() {
		return role != Role.CRM_SALES_REPRESENTATIVE;
	}

	public boolean includesOwner(Long ownerId) {
		return ownerId != null && (orgWide || ownerIds.contains(ownerId));
	}

	public boolean canViewDeal(Long dealOwnerId) {
		return role != Role.CRM_SALES_REPRESENTATIVE || viewerId.equals(dealOwnerId);
	}

}
