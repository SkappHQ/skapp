package com.skapp.community.leaveplanner.type;

import lombok.Getter;

@Getter
public enum PolicyLeaveRequestSort {

	CREATED_DATE("createdDate"), START_DATE("startDate");

	private final String sortField;

	PolicyLeaveRequestSort(String sortField) {
		this.sortField = sortField;
	}

	@Override
	public String toString() {
		return this.sortField;
	}

}
