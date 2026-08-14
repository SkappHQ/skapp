package com.skapp.community.timeplanner.type;

import lombok.Getter;

@Getter
public enum TimeRequestSort {

	// createdDate is inherited from Auditable, which owns the created_date column.
	REQUESTED_START_TIME("requestedStartTime"), REQUESTED_END_TIME("requestedEndTime"), CREATION_DATE("createdDate");

	private final String sortField;

	TimeRequestSort(String sortField) {
		this.sortField = sortField;
	}

	@Override
	public String toString() {
		return this.sortField;
	}

}
