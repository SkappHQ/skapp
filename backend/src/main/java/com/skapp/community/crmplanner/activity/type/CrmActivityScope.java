package com.skapp.community.crmplanner.activity.type;

import com.skapp.community.common.type.Role;

import java.util.Set;

public record CrmActivityScope(Long viewerId, Role role, boolean orgWide, Set<Long> ownerIds) {

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
