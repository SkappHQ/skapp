package com.skapp.community.leaveplanner.type;

import lombok.Getter;

@Getter
public enum CustomEntitlementSort {

	CREATION_DATE("creationDate"), VALID_FROM("validFrom");

	private final String sortField;

	CustomEntitlementSort(String sortField) {
		this.sortField = sortField;
	}

	@Override
	public String toString() {
		return this.sortField;
	}

}
