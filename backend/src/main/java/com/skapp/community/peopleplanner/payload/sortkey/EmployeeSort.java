package com.skapp.community.peopleplanner.payload.sortkey;

import lombok.Getter;

@Getter
public enum EmployeeSort {

	NAME("name"), JOIN_DATE("joinDate");

	private final String sortField;

	EmployeeSort(String sortField) {
		this.sortField = sortField;
	}

	@Override
	public String toString() {
		return this.sortField;
	}

}
