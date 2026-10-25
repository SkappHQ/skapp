package com.skapp.community.crmplanner.type;

import java.util.Set;

public record CrmActivityScope(Long viewerId, boolean canFilter, boolean orgWide, Set<Long> ownerIds) {

	public boolean includesOwner(Long ownerId) {
		return ownerId != null && (orgWide || ownerIds.contains(ownerId));
	}

}
