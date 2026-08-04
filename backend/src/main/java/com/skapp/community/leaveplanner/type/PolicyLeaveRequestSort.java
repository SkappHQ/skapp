package com.skapp.community.leaveplanner.type;

import lombok.Getter;

/**
 * Sort keys offered by the My Requests table on the policy leave flow. Deliberately a
 * separate enum from {@link LeaveRequestSort} so the two tables can diverge.
 */
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
