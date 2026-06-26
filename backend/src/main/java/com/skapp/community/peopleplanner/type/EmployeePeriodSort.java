package com.skapp.community.peopleplanner.type;

import lombok.Getter;

@Getter
public enum EmployeePeriodSort {

	ID("id");

	private final String sortField;

	EmployeePeriodSort(String sortField) {
		this.sortField = sortField;
	}

	@Override
	public String toString() {
		return this.sortField;
	}

}
