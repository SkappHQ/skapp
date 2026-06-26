package com.skapp.community.leaveplanner.type;

import lombok.Getter;

@Getter
public enum CustomLeaveEntitlementSort {

	CREATED_DATE("createdDate"), VALID_FROM("validFrom");

	private final String sortField;

	CustomLeaveEntitlementSort(String sortField) {
		this.sortField = sortField;
	}

	@Override
	public String toString() {
		return this.sortField;
	}

}
