package com.skapp.community.timeplanner.type;

import lombok.Getter;

@Getter
public enum TimeSlotSort {

	START_TIME("startTime"), END_TIME("endTime");

	private final String sortField;

	TimeSlotSort(String sortField) {
		this.sortField = sortField;
	}

	@Override
	public String toString() {
		return this.sortField;
	}

}
