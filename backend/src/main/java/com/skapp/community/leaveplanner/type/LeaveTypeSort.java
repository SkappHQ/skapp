package com.skapp.community.leaveplanner.type;

import lombok.Getter;

@Getter
public enum LeaveTypeSort {

	NAME("name");

	private final String sortField;

	LeaveTypeSort(String sortField) {
		this.sortField = sortField;
	}

	@Override
	public String toString() {
		return this.sortField;
	}

}
