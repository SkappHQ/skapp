package com.skapp.community.peopleplanner.payload.sortkey;

import lombok.Getter;

@Getter
public enum LogFilterDailySort {

	DATE("date");

	private final String sortField;

	LogFilterDailySort(String sortField) {
		this.sortField = sortField;
	}

	@Override
	public String toString() {
		return this.sortField;
	}

}
