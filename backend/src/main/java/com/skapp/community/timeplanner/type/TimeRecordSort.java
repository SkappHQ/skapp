package com.skapp.community.timeplanner.type;

import lombok.Getter;

@Getter
public enum TimeRecordSort {

	NAME("firstName"), DATE("date");

	private final String sortField;

	TimeRecordSort(String sortField) {
		this.sortField = sortField;
	}

	@Override
	public String toString() {
		return this.sortField;
	}

}
